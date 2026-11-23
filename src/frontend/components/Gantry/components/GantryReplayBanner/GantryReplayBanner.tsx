import { memo, useState } from 'react';
import { FilmStrip, Info, Spinner, X } from '@phosphor-icons/react';
import {
  useReplayContextSnapshot,
  useReplayRebuildSnapshot,
  useSessionList,
} from '@irdashies/context';

export type GantryReplayBannerProvenance =
  'archived' | 'localNotArchived' | 'foreign' | 'reconstructed';

interface GantryReplayBannerProps {
  provenance: GantryReplayBannerProvenance;
  onDismiss: () => void;
}

const MESSAGES: Record<GantryReplayBannerProvenance, string> = {
  archived: 'Replay — showing events recorded on this PC during the session.',
  localNotArchived:
    "irDashies wasn't recording when this session ran, so there is no event log for this replay. Standings still follow the replay.",
  foreign:
    'This replay was recorded on another computer. Event history is only available for sessions irDashies recorded on this PC. Standings still follow the replay.',
  reconstructed:
    'Event log rebuilt from this replay. Incidents and lap history were reconstructed in a background scan.',
};

const REBUILD_PROVENANCES: GantryReplayBannerProvenance[] = [
  'localNotArchived',
  'foreign',
];

export const GantryReplayBanner = memo(
  ({ provenance, onDismiss }: GantryReplayBannerProps) => {
    const Icon = provenance === 'archived' ? FilmStrip : Info;
    const canRebuild = REBUILD_PROVENANCES.includes(provenance);
    const rebuildSnapshot = useReplayRebuildSnapshot();
    const sessions = useSessionList();
    const rebuildStatus = rebuildSnapshot.status;
    const isRunning =
      rebuildStatus.kind === 'sweeping' ||
      rebuildStatus.kind === 'confirming' ||
      rebuildStatus.kind === 'preparing' ||
      rebuildStatus.kind === 'writing';
    const isInterrupted = rebuildStatus.kind === 'interrupted';

    const handleRebuild = () => {
      const sessionNums = (sessions ?? [])
        .map((s) => s.SessionNum)
        .filter((n): n is number => typeof n === 'number');
      void window.replayRebuildBridge?.start(sessionNums);
    };

    const handleResume = () => {
      void window.replayRebuildBridge?.resume();
    };

    const handleCancel = () => {
      void window.replayRebuildBridge?.cancel();
    };

    const progressText = (() => {
      if (rebuildStatus.kind === 'preparing') return 'Preparing…';
      if (rebuildStatus.kind === 'sweeping')
        return `Scanning session ${rebuildStatus.sessionIndex + 1}/${rebuildStatus.totalSessions} at ${rebuildStatus.progressPct.toFixed(0)}%…`;
      if (rebuildStatus.kind === 'confirming')
        return `Confirming window ${rebuildStatus.windowIndex + 1}/${rebuildStatus.totalWindows}…`;
      if (rebuildStatus.kind === 'writing') return 'Writing results…';
      return null;
    })();

    return (
      <div
        role="status"
        className="settings-shell flex flex-col gap-1 px-4 py-1.5 bg-slate-800 border-b border-slate-700 text-sm text-slate-300 shrink-0"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-amber-400 shrink-0" />
          <span className="flex-1 min-w-0">{MESSAGES[provenance]}</span>
          {canRebuild && !isRunning && !isInterrupted && (
            <button
              type="button"
              onClick={handleRebuild}
              className="shrink-0 rounded px-2 py-0.5 text-xs font-medium bg-amber-600/20 text-amber-300 hover:bg-amber-600/40 transition-colors"
            >
              Rebuild event log
            </button>
          )}
          {canRebuild && isInterrupted && (
            <button
              type="button"
              onClick={handleResume}
              className="shrink-0 rounded px-2 py-0.5 text-xs font-medium bg-amber-600/20 text-amber-300 hover:bg-amber-600/40 transition-colors"
            >
              Resume rebuild
            </button>
          )}
          {canRebuild && isRunning && (
            <button
              type="button"
              onClick={handleCancel}
              className="shrink-0 rounded px-2 py-0.5 text-xs font-medium bg-slate-600/40 text-slate-300 hover:bg-slate-600/60 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            aria-label="Dismiss replay message"
            onClick={onDismiss}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
          >
            <X size={14} />
          </button>
        </div>
        {isRunning && progressText && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-5">
            <Spinner size={12} className="animate-spin" />
            <span>{progressText}</span>
          </div>
        )}
      </div>
    );
  }
);
GantryReplayBanner.displayName = 'GantryReplayBanner';

/**
 * Shows the banner while a replay file is loaded. Dismissing hides it until
 * the replay context changes, which happens when the next replay loads.
 */
export const GantryReplayNotice = () => {
  const { mode, provenance, version } = useReplayContextSnapshot();
  const [dismissedVersion, setDismissedVersion] = useState<number | null>(null);
  if (mode !== 'replayFile' || provenance === 'none') return null;
  if (dismissedVersion === version) return null;
  return (
    <GantryReplayBanner
      provenance={provenance}
      onDismiss={() => setDismissedVersion(version)}
    />
  );
};
