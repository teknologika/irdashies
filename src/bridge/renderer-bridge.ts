import { contextBridge, ipcRenderer } from 'electron';
import type { TelemetryVarList, SessionInfo } from '@irsdk-node/types';

export function exposeBridge() {
  contextBridge.exposeInMainWorld('irsdkBridge', {
    onTelemetry: (callback: (value: TelemetryVarList) => void) =>
      ipcRenderer.on('telemetry', (_, value) => {
        callback(value);
      }),
    onSessionInfo: (callback: (value: SessionInfo) => void) =>
      ipcRenderer.on('sessionInfo', (_, value) => {
        callback(value);
      }),
    stop: () => {
      ipcRenderer.removeAllListeners('telemetry');
      ipcRenderer.removeAllListeners('sessionInfo');
    },
  } as Window['irsdkBridge']);
}
