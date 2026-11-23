import { TrackLocation } from '../../types/irSdk/enums';
import type { IncidentThresholds } from '../../types/raceControl';

export interface SuspicionWindow {
  sessionNum: number;
  startTime: number;
  endTime: number;
}

interface CarState {
  prevLapDistPct: number | null;
  prevSessionTime: number | null;
  prevSpeed: number | null;
}

/** Seconds before a suspicious event that the confirm window begins. */
const PRE_WINDOW_S = 3;
/** Seconds after a suspicious event that the confirm window ends. */
const POST_WINDOW_S = 4;
/** Extra lead-in time for the IncidentDetector's speed baseline to seed. */
export const CONFIRM_PREROLL_S = 2;

/**
 * Watches 16x-downsampled frames for signals that an incident may have
 * occurred, and emits windows for pass-2 confirmation.
 *
 * Over-reports deliberately: the loose thresholds here ensure no real incident
 * is missed. Pass 2 runs the full detector at impact speed.
 */
export class SuspicionScanner {
  private readonly carStates = new Map<number, CarState>();
  private readonly windows: SuspicionWindow[] = [];
  private currentSessionNum = 0;

  constructor(private readonly thresholds: IncidentThresholds) {}

  onFrame(frame: {
    sessionNum: number;
    sessionTime: number;
    carIdxLapDistPct: readonly number[];
    carIdxTrackSurface: readonly (number | undefined)[];
    carIdxOnPitRoad: readonly (boolean | undefined)[];
    trackLengthM: number;
  }): void {
    const {
      sessionNum,
      sessionTime,
      carIdxLapDistPct,
      carIdxTrackSurface,
      carIdxOnPitRoad,
      trackLengthM,
    } = frame;

    if (sessionNum !== this.currentSessionNum) {
      this.carStates.clear();
      this.currentSessionNum = sessionNum;
    }

    for (let i = 0; i < carIdxLapDistPct.length; i++) {
      const lapDistPct = carIdxLapDistPct[i];
      const surface = carIdxTrackSurface[i];
      const onPitRoad = carIdxOnPitRoad[i] ?? false;

      if (lapDistPct === undefined || lapDistPct < 0) continue;

      let state = this.carStates.get(i);
      if (!state) {
        state = {
          prevLapDistPct: null,
          prevSessionTime: null,
          prevSpeed: null,
        };
        this.carStates.set(i, state);
      }

      let suspicious = false;

      if (
        state.prevLapDistPct !== null &&
        state.prevSessionTime !== null &&
        trackLengthM > 0
      ) {
        const dt = sessionTime - state.prevSessionTime;
        if (dt > 0 && dt < 2) {
          let distPct = lapDistPct - state.prevLapDistPct;
          if (distPct < -0.5) distPct += 1.0;
          if (distPct < 0) distPct = 0;
          const speedKmh = ((trackLengthM * distPct) / dt) * 3.6;

          if (state.prevSpeed !== null && speedKmh > 0) {
            const decel = (state.prevSpeed - speedKmh) / dt;
            const looseThreshold = this.thresholds.impactDecelKmhPerSec * 0.5;
            if (
              decel >= looseThreshold &&
              state.prevSpeed >= this.thresholds.impactMinSpeed
            ) {
              suspicious = true;
            }
          }

          state.prevSpeed = speedKmh;
        }
      }

      if (
        surface !== undefined &&
        surface !== TrackLocation.OnTrack &&
        surface !== TrackLocation.InPitStall &&
        surface !== TrackLocation.ApproachingPits &&
        !onPitRoad
      ) {
        suspicious = true;
      }

      state.prevLapDistPct = lapDistPct;
      state.prevSessionTime = sessionTime;

      if (suspicious) {
        this.addWindow(sessionNum, sessionTime);
      }
    }
  }

  snapshot(): readonly SuspicionWindow[] {
    return this.windows;
  }

  private addWindow(sessionNum: number, centerTime: number): void {
    const start = Math.max(0, centerTime - PRE_WINDOW_S);
    const end = centerTime + POST_WINDOW_S;

    for (const w of this.windows) {
      if (
        w.sessionNum === sessionNum &&
        start <= w.endTime &&
        end >= w.startTime
      ) {
        w.startTime = Math.min(w.startTime, start);
        w.endTime = Math.max(w.endTime, end);
        return;
      }
    }

    this.windows.push({ sessionNum, startTime: start, endTime: end });
  }
}

/**
 * Extends `baselineSec` seconds of SPEED_BASELINE_S history that the
 * IncidentDetector needs to seed before detection starts.
 */
export const prerollFor = (): number => CONFIRM_PREROLL_S;
