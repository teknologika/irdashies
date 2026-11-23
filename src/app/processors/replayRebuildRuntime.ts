import type {
  Incident,
  LapHistorySnapshot,
  PitStopRecord,
  PitStopSessionKey,
  Session,
  Telemetry,
} from '@irdashies/types';
import { ReplayPositionCommand } from '@irdashies/types';
import type { ChannelBus } from '../bridge/channelBus';
import type { IrSdkSourceBridge } from '@irdashies/types';
import {
  IncidentProcessor,
  defaultIncidentThresholds,
} from './IncidentProcessor';
import { LapHistoryProcessor } from './LapHistoryProcessor';
import { PitStopProcessor } from './PitStopProcessor';
import { SuspicionScanner, CONFIRM_PREROLL_S } from './suspicionScanner';
import { REBUILD_SPEEDS } from './rebuildSpeeds';
import type { IncidentPersistence } from './incidentRuntime';
import type { LapHistoryPersistence } from './lapHistoryRuntime';
import type { PitStopPersistence } from './pitStopRuntime';
import type { ReplayRebuildRecord } from '../storage/replayRebuilds';
import { isArchivableSubSessionId } from './ReplayContextProcessor';
import logger from '../logger';
import type {
  ReplayRebuildSnapshot,
  ReplayRebuildStatus,
} from '../../types/replayRebuild';

/** Frame number jump (absolute delta) that signals a scrub. */
const FRAME_JUMP_TOLERANCE = 150;
/** Minimum wall-clock interval between channel publishes (ms). */
const PUBLISH_INTERVAL_MS = 500;

interface RebuildProgress {
  incidents: Incident[];
  lapSnapshots: Map<number, LapHistorySnapshot>;
  pitStops: Map<string, PitStopRecord[]>;
  windows: { sessionNum: number; startTime: number; endTime: number }[];
  windowsConfirmed: number;
}

type RebuildState =
  | { kind: 'idle' }
  | { kind: 'preparing' }
  | {
      kind: 'running';
      sessionNums: number[];
      currentSessionIdx: number;
      phase: 'sweep' | 'confirm';
      windowIdx: number;
      progress: RebuildProgress;
      prerollDone: boolean;
      sessionStartFrame: number | null;
    }
  | {
      kind: 'interrupted';
      sessionNums: number[];
      currentSessionIdx: number;
      progress: RebuildProgress;
    }
  | { kind: 'writing' };

export class ReplayRebuildRuntime {
  private state: RebuildState = { kind: 'idle' };
  private version = 0;
  private lastPublishMs = 0;
  private lastReplayFrame: number | null = null;
  private savedReplayFrame: number | null = null;
  private currentSession: Session | null = null;

  private sweepLapProc: LapHistoryProcessor | null = null;
  private sweepPitProc: PitStopProcessor | null = null;
  private sweepIncidentProc: IncidentProcessor | null = null;
  private sweepScanner: SuspicionScanner | null = null;
  private confirmIncidentProc: IncidentProcessor | null = null;

  constructor(
    private readonly bus: ChannelBus,
    private readonly getSourceBridge: () => IrSdkSourceBridge | undefined,
    private readonly incidentPersistence: IncidentPersistence,
    private readonly lapHistoryPersistence: LapHistoryPersistence,
    private readonly pitStopPersistence: PitStopPersistence,
    private readonly onRebuildComplete: (
      record: ReplayRebuildRecord
    ) => Promise<void>,
    private readonly onReplayContextRefresh: () => void
  ) {}

  onSession(session: Session): void {
    this.currentSession = session;
    if (this.sweepLapProc) this.sweepLapProc.init(session);
    if (this.sweepPitProc) this.sweepPitProc.init(session);
    if (this.sweepIncidentProc) this.sweepIncidentProc.init(session);
    if (this.confirmIncidentProc) this.confirmIncidentProc.init(session);
  }

  onFrame(frame: Telemetry): void {
    if (this.state.kind !== 'running') return;
    const st = this.state;

    const replayFrame = frame.ReplayFrameNum?.value?.[0] ?? 0;
    const replaySpeed = frame.ReplayPlaySpeed?.value?.[0] ?? 0;
    const sessionNum = frame.SessionNum?.value?.[0] ?? 0;
    const sessionTime = frame.SessionTime?.value?.[0] ?? 0;
    const replayFrameEnd = frame.ReplayFrameNumEnd?.value?.[0] ?? 0;

    if (this.lastReplayFrame !== null && st.sessionStartFrame !== null) {
      const delta = replayFrame - this.lastReplayFrame;
      const expectedDir = replaySpeed > 0 ? 1 : -1;
      if (
        Math.abs(delta) > FRAME_JUMP_TOLERANCE ||
        (delta !== 0 && Math.sign(delta) !== expectedDir)
      ) {
        this.interrupt('scrub detected');
        return;
      }
    }
    this.lastReplayFrame = replayFrame;

    if (st.phase === 'sweep') {
      this.runSweepFrame(
        frame,
        st,
        replayFrame,
        replayFrameEnd,
        sessionNum,
        sessionTime
      );
    } else {
      this.runConfirmFrame(frame, st, sessionTime);
    }

    this.maybePublish();
  }

  async start(sessionNums: number[]): Promise<void> {
    if (this.state.kind !== 'idle') {
      throw new Error('Rebuild already in progress');
    }
    if (!this.currentSession) {
      throw new Error('No session loaded');
    }
    const subSessionId =
      this.currentSession.WeekendInfo?.SubSessionID?.toString() ?? '';
    if (!isArchivableSubSessionId(subSessionId)) {
      throw new Error('SubSessionID 0 cannot be persisted');
    }

    logger.info(
      `[ReplayRebuild] Starting rebuild for sessions ${sessionNums.join(', ')}`
    );
    this.state = { kind: 'preparing' };
    this.publish();

    this.savedReplayFrame = this.lastReplayFrame;
    this.startSweep(sessionNums, 0, {
      incidents: [],
      lapSnapshots: new Map(),
      pitStops: new Map(),
      windows: [],
      windowsConfirmed: 0,
    });
  }

  async resume(): Promise<void> {
    if (this.state.kind !== 'interrupted') return;
    const { sessionNums, currentSessionIdx, progress } = this.state;
    this.startSweep(sessionNums, currentSessionIdx, progress);
  }

  async cancel(): Promise<void> {
    if (this.state.kind === 'idle' || this.state.kind === 'writing') return;
    logger.info('[ReplayRebuild] Cancelled');
    this.reset();
  }

  getSnapshot(): ReplayRebuildSnapshot {
    return { status: this.buildStatus(), version: this.version };
  }

  private startSweep(
    sessionNums: number[],
    sessionIdx: number,
    progress: RebuildProgress
  ): void {
    if (sessionIdx >= sessionNums.length) {
      void this.finishRebuild(sessionNums, progress);
      return;
    }

    const sessionNum = sessionNums[sessionIdx];
    logger.info(
      `[ReplayRebuild] Sweeping session ${sessionNum} at ${REBUILD_SPEEDS.sweep}x`
    );

    this.sweepLapProc = new LapHistoryProcessor();
    this.sweepPitProc = new PitStopProcessor();
    this.sweepIncidentProc = new IncidentProcessor({
      skipImpactDetection: true,
    });
    this.sweepScanner = new SuspicionScanner(defaultIncidentThresholds);

    if (this.currentSession) {
      this.sweepLapProc.init(this.currentSession);
      this.sweepPitProc.init(this.currentSession);
      this.sweepIncidentProc.init(this.currentSession);
    }

    this.state = {
      kind: 'running',
      sessionNums,
      currentSessionIdx: sessionIdx,
      phase: 'sweep',
      windowIdx: 0,
      progress,
      prerollDone: true,
      sessionStartFrame: null,
    };

    const bridge = this.getSourceBridge();
    if (bridge) {
      bridge.triggerReplaySessionSearch(sessionNum, 0);
      bridge.changeReplaySpeed(REBUILD_SPEEDS.sweep, false);
    }
    this.publish();
  }

  private runSweepFrame(
    frame: Telemetry,
    st: Extract<RebuildState, { kind: 'running' }>,
    replayFrame: number,
    replayFrameEnd: number,
    sessionNum: number,
    sessionTime: number
  ): void {
    const targetSession = st.sessionNums[st.currentSessionIdx];

    if (st.sessionStartFrame === null && sessionNum === targetSession) {
      st.sessionStartFrame = replayFrame;
    }

    if (sessionNum === targetSession) {
      this.sweepLapProc?.onFrame(frame);
      this.sweepPitProc?.onFrame(frame);
      this.sweepIncidentProc?.onFrame(frame);

      const trackLengthM =
        parseFloat(this.currentSession?.WeekendInfo?.TrackLength ?? '0') * 1000;
      this.sweepScanner?.onFrame({
        sessionNum,
        sessionTime,
        carIdxLapDistPct: frame.CarIdxLapDistPct?.value ?? [],
        carIdxTrackSurface: frame.CarIdxTrackSurface?.value ?? [],
        carIdxOnPitRoad: frame.CarIdxOnPitRoad?.value ?? [],
        trackLengthM,
      });
    }

    const sweepDone =
      sessionNum !== targetSession && st.sessionStartFrame !== null;
    const atEnd = replayFrameEnd > 0 && replayFrame >= replayFrameEnd - 10;

    if (sweepDone || atEnd) {
      this.finishSweep(st);
    }
  }

  private finishSweep(st: Extract<RebuildState, { kind: 'running' }>): void {
    const targetSession = st.sessionNums[st.currentSessionIdx];

    const lapSnapshot = this.sweepLapProc?.snapshot();
    if (lapSnapshot) {
      st.progress.lapSnapshots.set(targetSession, lapSnapshot);
    }

    const pitSnapshot = this.sweepPitProc?.snapshot();
    if (
      pitSnapshot &&
      pitSnapshot.subSessionId !== null &&
      pitSnapshot.sessionNum !== null
    ) {
      const key = `${pitSnapshot.subSessionId}:${pitSnapshot.sessionNum}`;
      st.progress.pitStops.set(key, [...pitSnapshot.stops]);
    }

    const windows = this.sweepScanner?.snapshot() ?? [];
    st.progress.windows.push(...windows);

    logger.info(
      `[ReplayRebuild] Sweep done session ${targetSession}: ` +
        `${windows.length} suspicion windows`
    );

    this.sweepLapProc = null;
    this.sweepPitProc = null;
    this.sweepIncidentProc = null;
    this.sweepScanner = null;

    if (windows.length === 0) {
      this.advanceToNextSession(st);
      return;
    }

    st.phase = 'confirm';
    st.windowIdx = 0;
    this.seekToWindow(st, 0);
  }

  private seekToWindow(
    st: Extract<RebuildState, { kind: 'running' }>,
    windowIdx: number
  ): void {
    const window = st.progress.windows[windowIdx];
    if (!window) {
      this.advanceToNextSession(st);
      return;
    }

    st.windowIdx = windowIdx;
    st.prerollDone = false;

    this.confirmIncidentProc = new IncidentProcessor();
    if (this.currentSession) {
      this.confirmIncidentProc.init(this.currentSession);
    }

    const bridge = this.getSourceBridge();
    if (bridge) {
      const prerollTime = Math.max(0, window.startTime - CONFIRM_PREROLL_S);
      bridge.triggerReplaySessionSearch(window.sessionNum, prerollTime * 1000);
      bridge.changeReplaySpeed(REBUILD_SPEEDS.impact, false);
    }
  }

  private runConfirmFrame(
    frame: Telemetry,
    st: Extract<RebuildState, { kind: 'running' }>,
    sessionTime: number
  ): void {
    const window = st.progress.windows[st.windowIdx];
    if (!window) return;

    if (!st.prerollDone && sessionTime >= window.startTime) {
      st.prerollDone = true;
    }

    this.confirmIncidentProc?.onFrame(frame);

    if (st.prerollDone && this.confirmIncidentProc) {
      for (const inc of this.confirmIncidentProc.snapshot()) {
        st.progress.incidents.push(inc);
      }
    }

    if (sessionTime >= window.endTime) {
      st.progress.windowsConfirmed += 1;
      this.confirmIncidentProc = null;

      const nextIdx = st.windowIdx + 1;
      if (nextIdx < st.progress.windows.length) {
        this.seekToWindow(st, nextIdx);
      } else {
        this.advanceToNextSession(st);
      }
    }
  }

  private advanceToNextSession(
    st: Extract<RebuildState, { kind: 'running' }>
  ): void {
    const nextIdx = st.currentSessionIdx + 1;
    this.startSweep(st.sessionNums, nextIdx, st.progress);
  }

  private async finishRebuild(
    sessionNums: number[],
    progress: RebuildProgress
  ): Promise<void> {
    this.state = { kind: 'writing' };
    this.publish();

    const subSessionId =
      this.currentSession?.WeekendInfo?.SubSessionID?.toString() ?? '';
    logger.info(`[ReplayRebuild] Writing results for ${subSessionId}`);

    try {
      for (const inc of progress.incidents) {
        this.incidentPersistence.save(subSessionId, inc);
      }

      for (const [sessionNum, lapSnapshot] of progress.lapSnapshots) {
        this.lapHistoryPersistence.save(subSessionId, lapSnapshot);
        this.lapHistoryPersistence.seal(subSessionId, lapSnapshot);
        void sessionNum;
      }

      for (const [key, stops] of progress.pitStops) {
        const colonIdx = key.indexOf(':');
        if (colonIdx < 0) continue;
        const subNum = parseInt(key.slice(0, colonIdx), 10);
        const sessionNum = parseInt(key.slice(colonIdx + 1), 10);
        if (!isNaN(subNum) && !isNaN(sessionNum)) {
          const pitKey: PitStopSessionKey = {
            subSessionId: subNum,
            sessionNum,
          };
          this.pitStopPersistence.save(pitKey, stops);
        }
      }

      let lapsTotal = 0;
      for (const snap of progress.lapSnapshots.values()) {
        lapsTotal += snap.count.reduce((a, b) => a + b, 0);
      }

      const record: ReplayRebuildRecord = {
        subSessionId,
        sessionNums,
        completedAt: Date.now(),
        sweepSpeed: REBUILD_SPEEDS.sweep,
        confirmSpeed: REBUILD_SPEEDS.impact,
        coverage: sessionNums.map((sn) => {
          const snap = progress.lapSnapshots.get(sn);
          const laps = snap ? snap.count.reduce((a, b) => a + b, 0) : 0;
          return { sessionNum: sn, lapsFound: laps, lapsInResults: laps };
        }),
      };
      await this.onRebuildComplete(record);
      this.onReplayContextRefresh();

      this.state = { kind: 'idle' };
      this.version++;
      this.bus.publish('replay.rebuild', {
        status: {
          kind: 'done',
          incidentsTotal: progress.incidents.length,
          lapsTotal,
          completedAt: record.completedAt,
        },
        version: this.version,
      });
    } catch (err) {
      logger.error('[ReplayRebuild] Failed to write results:', err);
      this.state = { kind: 'idle' };
      this.publish();
    } finally {
      this.restoreReplay();
    }
  }

  private interrupt(reason: string): void {
    if (this.state.kind !== 'running') return;
    const { sessionNums, currentSessionIdx, progress } = this.state;
    logger.info(`[ReplayRebuild] Interrupted: ${reason}`);
    this.sweepLapProc = null;
    this.sweepPitProc = null;
    this.sweepIncidentProc = null;
    this.sweepScanner = null;
    this.confirmIncidentProc = null;
    this.state = {
      kind: 'interrupted',
      sessionNums,
      currentSessionIdx,
      progress,
    };
    this.publish();
    this.restoreReplay();
  }

  private reset(): void {
    this.sweepLapProc = null;
    this.sweepPitProc = null;
    this.sweepIncidentProc = null;
    this.sweepScanner = null;
    this.confirmIncidentProc = null;
    this.state = { kind: 'idle' };
    this.publish();
    this.restoreReplay();
  }

  private restoreReplay(): void {
    const bridge = this.getSourceBridge();
    if (!bridge || this.savedReplayFrame === null) return;
    bridge.changeReplayPosition(
      ReplayPositionCommand.Current,
      this.savedReplayFrame
    );
    bridge.changeReplaySpeed(1, false);
    this.savedReplayFrame = null;
  }

  private buildStatus(): ReplayRebuildStatus {
    const st = this.state;
    switch (st.kind) {
      case 'idle':
        return { kind: 'idle' };
      case 'preparing':
        return { kind: 'preparing' };
      case 'writing':
        return { kind: 'writing' };
      case 'interrupted':
        return {
          kind: 'interrupted',
          sessionIndex: st.currentSessionIdx,
          totalSessions: st.sessionNums.length,
        };
      case 'running': {
        const total = st.sessionNums.length;
        const idx = st.currentSessionIdx;
        const sessionNum = st.sessionNums[idx];
        let lapsFound = 0;
        for (const snap of st.progress.lapSnapshots.values()) {
          lapsFound += snap.count.reduce((a, b) => a + b, 0);
        }
        if (st.phase === 'sweep') {
          return {
            kind: 'sweeping',
            sessionNum,
            sessionIndex: idx,
            totalSessions: total,
            progressPct: 0,
            windowsFound: st.progress.windows.length,
            lapsFound,
          };
        }
        const totalWindows = st.progress.windows.length;
        return {
          kind: 'confirming',
          sessionNum,
          sessionIndex: idx,
          totalSessions: total,
          windowIndex: st.windowIdx,
          totalWindows,
          progressPct:
            totalWindows > 0 ? (st.windowIdx / totalWindows) * 100 : 100,
          incidentsFound: st.progress.incidents.length,
          lapsFound,
        };
      }
    }
  }

  private publish(): void {
    this.version++;
    this.bus.publish('replay.rebuild', {
      status: this.buildStatus(),
      version: this.version,
    });
  }

  private maybePublish(): void {
    const now = Date.now();
    if (now - this.lastPublishMs < PUBLISH_INTERVAL_MS) return;
    this.lastPublishMs = now;
    this.publish();
  }
}
