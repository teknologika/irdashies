import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import {
  useCameraStateSnapshot,
  useSessionCameraGroups,
} from '@irdashies/context';
import type { CameraFocusMode } from '@irdashies/types';
import { CAM_STATE_UI_HIDDEN } from '@irdashies/types';
import type { CameraGroup } from '@irdashies/types';

export interface GantryCameraBarDriver {
  carIdx: number;
  carNumber: string;
  name: string;
}

/** Which autonomous mode the FOLLOWING row's buttons are in. */
export type CameraFollowMode = 'driver' | 'crashes' | 'leader' | 'exiting';

export interface GantryCameraBarProps {
  drivers: GantryCameraBarDriver[];
  stagedCarIdx: number | null;
  onStageChange: (carIdx: number | null) => void;
  followMode: CameraFollowMode;
  onFollowModeChange: (mode: CameraFollowMode) => void;
  onSwitchCamera: (focus: CameraFocusMode, groupNumber: number) => void;
  onSetStateFlags: (flags: number) => void;
  cameraGroups: CameraGroup[] | undefined;
  activeCamGroupNumber: number;
  activeCamCarIdx: number;
  activeCamState: number;
}

export interface GantryCameraBarContainerProps {
  drivers: GantryCameraBarDriver[];
  stagedCarIdx: number | null;
  onStageChange: (carIdx: number | null) => void;
  followMode: CameraFollowMode;
  onFollowModeChange: (mode: CameraFollowMode) => void;
}

const FOLLOW_MODES: { mode: CameraFollowMode; label: string }[] = [
  { mode: 'driver', label: 'Driver' },
  { mode: 'crashes', label: 'Crashes' },
  { mode: 'leader', label: 'Leader' },
  { mode: 'exiting', label: 'Most exciting' },
];

function toFocusMode(
  mode: CameraFollowMode,
  carNumber?: string
): CameraFocusMode {
  switch (mode) {
    case 'driver':
      return { type: 'driver', carNumber: carNumber ?? '' };
    case 'crashes':
      return { type: 'crashes' };
    case 'leader':
      return { type: 'leader' };
    case 'exiting':
      return { type: 'exiting' };
  }
}

function isBroadcastGroup(groupName: string): boolean {
  const lower = groupName.toLowerCase();
  return (
    lower.includes('tv') ||
    lower.includes('blimp') ||
    lower.includes('chopper') ||
    lower.includes('scenic') ||
    lower.includes('pit lane') ||
    lower.includes('pitlane') ||
    lower.includes('replay')
  );
}

function categoriseGroups(groups: CameraGroup[]): {
  onboard: CameraGroup[];
  broadcast: CameraGroup[];
} {
  const onboard: CameraGroup[] = [];
  const broadcast: CameraGroup[] = [];
  for (const g of groups) {
    if (isBroadcastGroup(g.GroupName)) {
      broadcast.push(g);
    } else {
      onboard.push(g);
    }
  }
  return { onboard, broadcast };
}

export const GantryCameraBar = memo(
  ({
    drivers,
    stagedCarIdx,
    onStageChange,
    followMode,
    onFollowModeChange,
    onSwitchCamera,
    onSetStateFlags,
    cameraGroups,
    activeCamGroupNumber,
    activeCamCarIdx,
    activeCamState,
  }: GantryCameraBarProps) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isUiHidden = (activeCamState & CAM_STATE_UI_HIDDEN) !== 0;
    const groups = cameraGroups ?? [];
    const { onboard, broadcast } = categoriseGroups(groups);
    const broadcastShortcuts = broadcast.slice(0, 5);

    const activeGroup = groups.find((g) => g.GroupNum === activeCamGroupNumber);
    const activeGroupName =
      activeGroup?.GroupName ??
      (groups.length === 0 ? '—' : `Group ${activeCamGroupNumber}`);

    const stagedDriver =
      stagedCarIdx !== null
        ? drivers.find((d) => d.carIdx === stagedCarIdx)
        : null;

    useEffect(() => {
      if (!dropdownOpen) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node)
        ) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen]);

    const handleFollowModeClick = useCallback(
      (mode: CameraFollowMode) => {
        onFollowModeChange(mode);
        if (mode !== 'driver') {
          onSwitchCamera(toFocusMode(mode), activeCamGroupNumber);
        }
      },
      [onFollowModeChange, onSwitchCamera, activeCamGroupNumber]
    );

    const handleGroupChange = useCallback(
      (groupNumber: number) => {
        setDropdownOpen(false);
        if (followMode === 'driver') {
          const driver = drivers.find((d) => d.carIdx === activeCamCarIdx);
          if (driver) {
            onSwitchCamera(
              { type: 'driver', carNumber: driver.carNumber },
              groupNumber
            );
            return;
          }
          onSwitchCamera({ type: 'crashes' }, groupNumber);
          return;
        }
        onSwitchCamera(toFocusMode(followMode), groupNumber);
      },
      [followMode, drivers, activeCamCarIdx, onSwitchCamera]
    );

    const handleCut = useCallback(() => {
      if (stagedCarIdx === null) return;
      const driver = drivers.find((d) => d.carIdx === stagedCarIdx);
      if (!driver) return;
      onSwitchCamera(
        { type: 'driver', carNumber: driver.carNumber },
        activeCamGroupNumber
      );
      onFollowModeChange('driver');
      onStageChange(null);
    }, [
      stagedCarIdx,
      drivers,
      onSwitchCamera,
      activeCamGroupNumber,
      onFollowModeChange,
      onStageChange,
    ]);

    const handleHideUiToggle = useCallback(() => {
      const next = isUiHidden
        ? activeCamState & ~CAM_STATE_UI_HIDDEN
        : activeCamState | CAM_STATE_UI_HIDDEN;
      onSetStateFlags(next);
    }, [isUiHidden, activeCamState, onSetStateFlags]);

    return (
      <div
        role="toolbar"
        aria-label="Camera controls"
        className="settings-shell shrink-0 flex flex-col border-b border-slate-700 bg-slate-900 text-white text-xs"
      >
        {/* Row 1 — FOLLOWING mode + NEXT + CUT */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-800">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 shrink-0 mr-1">
            Following
          </span>

          {FOLLOW_MODES.map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleFollowModeClick(mode)}
              className={[
                'inline-flex items-center px-2.5 h-6 rounded text-xs font-medium transition-colors shrink-0',
                mode === followMode
                  ? 'bg-red-900/40 border border-red-700 text-red-400'
                  : 'text-slate-400 border border-transparent hover:border-slate-600 hover:text-slate-200',
              ].join(' ')}
            >
              {label}
            </button>
          ))}

          <div className="flex-1" />

          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mr-1">
            Next
          </span>
          <div
            className={[
              'inline-flex items-center px-2.5 h-6 rounded min-w-[80px] max-w-[140px] text-xs transition-all truncate',
              stagedDriver
                ? 'border border-amber-500 text-amber-300 bg-amber-900/15'
                : 'border border-dashed border-slate-600 text-slate-500',
            ].join(' ')}
          >
            {stagedDriver ? stagedDriver.name : '—'}
          </div>
          <button
            type="button"
            disabled={stagedCarIdx === null}
            onClick={handleCut}
            className="inline-flex items-center px-3 h-6 rounded text-xs font-semibold text-slate-900 bg-amber-500 transition-colors hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            CUT
          </button>
        </div>

        {/* Row 2 — CAMERA group dropdown + shortcuts + Hide UI toggle */}
        <div className="flex items-center gap-1.5 px-3 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 shrink-0 mr-1">
            Camera
          </span>

          {groups.length > 0 && (
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                aria-label={`Camera group: ${activeGroupName}`}
                aria-expanded={dropdownOpen}
                aria-haspopup="listbox"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={[
                  'inline-flex items-center gap-1 px-2.5 h-6 rounded text-xs transition-colors shrink-0',
                  dropdownOpen
                    ? 'border border-slate-500 text-white bg-slate-700'
                    : 'border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white hover:bg-slate-800',
                ].join(' ')}
              >
                <span className="max-w-[90px] truncate">{activeGroupName}</span>
                <CaretDown
                  size={10}
                  className={`shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div
                  role="listbox"
                  aria-label="Camera group"
                  className="absolute top-full left-0 mt-1 z-50 bg-slate-800 border border-slate-600 rounded shadow-xl min-w-[160px] max-h-64 overflow-y-auto py-1"
                >
                  {onboard.length > 0 && (
                    <>
                      <div className="px-2.5 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        Onboard
                      </div>
                      {onboard.map((g) => (
                        <button
                          key={g.GroupNum}
                          type="button"
                          role="option"
                          aria-selected={g.GroupNum === activeCamGroupNumber}
                          onClick={() => handleGroupChange(g.GroupNum)}
                          className={[
                            'w-full text-left px-3 py-1 text-xs hover:bg-slate-700 transition-colors',
                            g.GroupNum === activeCamGroupNumber
                              ? 'text-red-400 bg-red-900/20'
                              : 'text-slate-300',
                          ].join(' ')}
                        >
                          {g.GroupName}
                        </button>
                      ))}
                    </>
                  )}
                  {broadcast.length > 0 && (
                    <>
                      <div className="px-2.5 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        Broadcast
                      </div>
                      {broadcast.map((g) => (
                        <button
                          key={g.GroupNum}
                          type="button"
                          role="option"
                          aria-selected={g.GroupNum === activeCamGroupNumber}
                          onClick={() => handleGroupChange(g.GroupNum)}
                          className={[
                            'w-full text-left px-3 py-1 text-xs hover:bg-slate-700 transition-colors',
                            g.GroupNum === activeCamGroupNumber
                              ? 'text-red-400 bg-red-900/20'
                              : 'text-slate-300',
                          ].join(' ')}
                        >
                          {g.GroupName}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {broadcastShortcuts.length > 0 && (
            <span
              aria-hidden="true"
              className="h-4 w-px bg-slate-700 mx-0.5 shrink-0"
            />
          )}

          {broadcastShortcuts.map((g) => (
            <button
              key={g.GroupNum}
              type="button"
              onClick={() => handleGroupChange(g.GroupNum)}
              className={[
                'inline-flex items-center px-2.5 h-6 rounded text-xs transition-colors shrink-0',
                g.GroupNum === activeCamGroupNumber
                  ? 'bg-red-900/40 border border-red-700 text-red-400'
                  : 'text-slate-400 border border-transparent hover:border-slate-600 hover:text-slate-200',
              ].join(' ')}
            >
              {g.GroupName}
            </button>
          ))}

          <div className="flex-1" />

          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mr-1.5">
            Hide UI
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isUiHidden}
            aria-label="Hide iRacing UI overlay"
            onClick={handleHideUiToggle}
            className={[
              'relative w-8 h-4 rounded-full transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400',
              isUiHidden ? 'bg-red-600' : 'bg-slate-600',
            ].join(' ')}
          >
            <span
              className={[
                'absolute top-[1px] left-[1px] w-3.5 h-3.5 rounded-full bg-white shadow transition-transform',
                isUiHidden ? 'translate-x-4' : 'translate-x-0',
              ].join(' ')}
            />
          </button>
        </div>
      </div>
    );
  }
);
GantryCameraBar.displayName = 'GantryCameraBar';

export const GantryCameraBarContainer = memo(
  ({
    drivers,
    stagedCarIdx,
    onStageChange,
    followMode,
    onFollowModeChange,
  }: GantryCameraBarContainerProps) => {
    const snap = useCameraStateSnapshot();
    const cameraGroups = useSessionCameraGroups();

    const handleSwitchCamera = useCallback(
      (focus: CameraFocusMode, groupNumber: number) => {
        void window.broadcastCameraBridge?.switchCamera(focus, groupNumber);
      },
      []
    );

    const handleSetStateFlags = useCallback((flags: number) => {
      void window.broadcastCameraBridge?.setStateFlags(flags);
    }, []);

    return (
      <GantryCameraBar
        drivers={drivers}
        stagedCarIdx={stagedCarIdx}
        onStageChange={onStageChange}
        followMode={followMode}
        onFollowModeChange={onFollowModeChange}
        onSwitchCamera={handleSwitchCamera}
        onSetStateFlags={handleSetStateFlags}
        cameraGroups={cameraGroups}
        activeCamGroupNumber={snap.camGroupNumber}
        activeCamCarIdx={snap.camCarIdx}
        activeCamState={snap.camCameraState}
      />
    );
  }
);
GantryCameraBarContainer.displayName = 'GantryCameraBarContainer';
