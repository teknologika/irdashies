import { ipcMain } from 'electron';
import type { CameraFocusMode } from '@irdashies/types';
import { getCurrentBridge } from './iracingSdk/setup';
import logger from '../logger';

const CS_FOCUS_AT_INCIDENT = -3;
const CS_FOCUS_AT_LEADER = -2;
const CS_FOCUS_AT_EXITING = -1;

const isFocusMode = (value: unknown): value is CameraFocusMode => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (v.type === 'crashes' || v.type === 'leader' || v.type === 'exiting') {
    return true;
  }
  return v.type === 'driver' && typeof v.carNumber === 'string';
};

const isGroupNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

const isStateFlags = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

export const setupBroadcastCameraBridge = (): void => {
  ipcMain.handle(
    'broadcastCamera:switch',
    (_event, focus: unknown, groupNumber: unknown) => {
      if (!isFocusMode(focus) || !isGroupNumber(groupNumber)) {
        logger.warn('[BroadcastCamera] Rejected invalid switchCamera args');
        return;
      }
      const bridge = getCurrentBridge();
      if (!bridge) return;

      if (focus.type === 'driver') {
        logger.info(
          `[BroadcastCamera] switchCamera driver=#${focus.carNumber} group=${groupNumber}`
        );
        bridge.changeCameraNumber(focus.carNumber, groupNumber, 0);
      } else {
        const position =
          focus.type === 'crashes'
            ? CS_FOCUS_AT_INCIDENT
            : focus.type === 'leader'
              ? CS_FOCUS_AT_LEADER
              : CS_FOCUS_AT_EXITING;
        logger.info(
          `[BroadcastCamera] switchCamera position=${position} (${focus.type}) group=${groupNumber}`
        );
        bridge.changeCameraPosition(position, groupNumber, 0);
      }
    }
  );

  ipcMain.handle('broadcastCamera:setStateFlags', (_event, flags: unknown) => {
    if (!isStateFlags(flags)) {
      logger.warn('[BroadcastCamera] Rejected invalid setStateFlags arg');
      return;
    }
    const bridge = getCurrentBridge();
    if (!bridge) return;
    logger.info(
      `[BroadcastCamera] setStateFlags flags=0x${flags.toString(16)}`
    );
    bridge.changeCameraState(flags);
  });
};
