import { memo, useState, useCallback } from 'react';
import { Monitor } from '@phosphor-icons/react';
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

export interface GantryCameraBarProps {
  drivers: GantryCameraBarDriver[];
  onSwitchCamera: (focus: CameraFocusMode, groupNumber: number) => void;
  onSetStateFlags: (flags: number) => void;
  cameraGroups: CameraGroup[] | undefined;
  activeCamGroupNumber: number;
  activeCamState: number;
}

const FOCUS_BUTTONS: {
  mode: Exclude<CameraFocusMode, { type: 'driver' }>;
  label: string;
}[] = [
  { mode: { type: 'crashes' }, label: 'Crashes' },
  { mode: { type: 'leader' }, label: 'Leader' },
  { mode: { type: 'exiting' }, label: 'Exiting' },
];

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
    onSwitchCamera,
    onSetStateFlags,
    cameraGroups,
    activeCamGroupNumber,
    activeCamState,
  }: GantryCameraBarProps) => {
    const [stagedCarIdx, setStagedCarIdx] = useState<number | null>(null);

    const isUiHidden = (activeCamState & CAM_STATE_UI_HIDDEN) !== 0;
    const groups = cameraGroups ?? [];
    const { onboard, broadcast } = categoriseGroups(groups);

    const handleFollowDriver = useCallback(
      (carIdx: number) => {
        const driver = drivers.find((d) => d.carIdx === carIdx);
        if (!driver) return;
        onSwitchCamera(
          { type: 'driver', carNumber: driver.carNumber },
          activeCamGroupNumber
        );
      },
      [drivers, onSwitchCamera, activeCamGroupNumber]
    );

    const handleFollowMode = useCallback(
      (mode: Exclude<CameraFocusMode, { type: 'driver' }>) => {
        onSwitchCamera(mode, activeCamGroupNumber);
      },
      [onSwitchCamera, activeCamGroupNumber]
    );

    const handleGroupChange = useCallback(
      (groupNumber: number) => {
        const snap = { type: 'crashes' } as CameraFocusMode;
        onSwitchCamera(snap, groupNumber);
      },
      [onSwitchCamera]
    );

    const handleCut = useCallback(() => {
      if (stagedCarIdx === null) return;
      const driver = drivers.find((d) => d.carIdx === stagedCarIdx);
      if (!driver) return;
      onSwitchCamera(
        { type: 'driver', carNumber: driver.carNumber },
        activeCamGroupNumber
      );
    }, [stagedCarIdx, drivers, onSwitchCamera, activeCamGroupNumber]);

    const handleHideUiToggle = useCallback(() => {
      const next = isUiHidden
        ? activeCamState & ~CAM_STATE_UI_HIDDEN
        : activeCamState | CAM_STATE_UI_HIDDEN;
      onSetStateFlags(next);
    }, [isUiHidden, activeCamState, onSetStateFlags]);

    const quickDrivers = drivers.slice(0, 5);

    return (
      <div
        role="toolbar"
        aria-label="Camera controls"
        className="settings-shell shrink-0 flex flex-col gap-0 border-b border-slate-700 bg-slate-900 text-white text-xs"
      >
        {/* Row 1 — following mode + camera group + hide UI */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-800">
          <span className="text-slate-500 shrink-0 mr-0.5">Follow</span>
          {FOCUS_BUTTONS.map(({ mode, label }) => (
            <button
              key={mode.type}
              type="button"
              onClick={() => handleFollowMode(mode)}
              className="inline-flex items-center px-2 h-6 rounded text-slate-300 transition-colors hover:bg-slate-700 hover:text-white shrink-0"
            >
              {label}
            </button>
          ))}
          <span
            aria-hidden="true"
            className="h-4 w-px bg-slate-700 mx-0.5 shrink-0"
          />
          {groups.length > 0 && (
            <select
              aria-label="Camera group"
              value={activeCamGroupNumber}
              onChange={(e) => handleGroupChange(Number(e.target.value))}
              className="settings-field h-6 py-0 text-xs min-w-0 w-36"
            >
              {onboard.length > 0 && (
                <optgroup label="Onboard">
                  {onboard.map((g) => (
                    <option key={g.GroupNum} value={g.GroupNum}>
                      {g.GroupName}
                    </option>
                  ))}
                </optgroup>
              )}
              {broadcast.length > 0 && (
                <optgroup label="Broadcast">
                  {broadcast.map((g) => (
                    <option key={g.GroupNum} value={g.GroupNum}>
                      {g.GroupName}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          )}
          <div className="flex-1" />
          <button
            type="button"
            aria-label="Hide iRacing UI"
            aria-pressed={isUiHidden}
            onClick={handleHideUiToggle}
            className="inline-flex items-center gap-1 px-2 h-6 rounded text-slate-400 transition-colors hover:bg-slate-700 hover:text-white aria-pressed:bg-slate-700 aria-pressed:text-white shrink-0"
          >
            <Monitor size={13} />
            Hide UI
          </button>
        </div>

        {/* Row 2 — stage + CUT + quick driver buttons */}
        <div className="flex items-center gap-1.5 px-3 py-1.5">
          <span className="text-slate-500 shrink-0 mr-0.5">Next</span>
          <select
            aria-label="Stage driver"
            value={stagedCarIdx ?? ''}
            onChange={(e) =>
              setStagedCarIdx(e.target.value ? Number(e.target.value) : null)
            }
            className="settings-field h-6 py-0 text-xs w-40 min-w-0"
          >
            <option value="">— select driver —</option>
            {drivers.map((d) => (
              <option key={d.carIdx} value={d.carIdx}>
                #{d.carNumber} {d.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={stagedCarIdx === null}
            onClick={handleCut}
            className="inline-flex items-center px-3 h-6 rounded text-xs font-semibold text-slate-900 bg-red-500 transition-colors hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            CUT
          </button>
          {quickDrivers.length > 0 && (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-px bg-slate-700 mx-0.5 shrink-0"
              />
              {quickDrivers.map((d) => (
                <button
                  key={d.carIdx}
                  type="button"
                  onClick={() => handleFollowDriver(d.carIdx)}
                  className="inline-flex items-center px-2 h-6 rounded font-mono text-slate-300 transition-colors hover:bg-slate-700 hover:text-white shrink-0"
                  title={d.name}
                >
                  #{d.carNumber}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    );
  }
);
GantryCameraBar.displayName = 'GantryCameraBar';

export const GantryCameraBarContainer = memo(
  ({ drivers }: { drivers: GantryCameraBarDriver[] }) => {
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
        onSwitchCamera={handleSwitchCamera}
        onSetStateFlags={handleSetStateFlags}
        cameraGroups={cameraGroups}
        activeCamGroupNumber={snap.camGroupNumber}
        activeCamState={snap.camCameraState}
      />
    );
  }
);
GantryCameraBarContainer.displayName = 'GantryCameraBarContainer';
