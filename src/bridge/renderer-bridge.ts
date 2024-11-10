import { contextBridge, ipcRenderer } from 'electron';
import type { TelemetryVarList, SessionData } from '@irsdk-node/types';
import type { IrSdkBridge } from './irSdkBridge.type';

export function exposeBridge() {
  contextBridge.exposeInMainWorld('irsdkBridge', {
    onTelemetry: (callback: (value: TelemetryVarList) => void) =>
      ipcRenderer.on('telemetry', (_, value) => {
        callback(value);
      }),
    onSessionData: (callback: (value: SessionData) => void) =>
      ipcRenderer.on('sessionInfo', (_, value) => {
        callback(value);
      }),
    stop: () => {
      ipcRenderer.removeAllListeners('telemetry');
      ipcRenderer.removeAllListeners('sessionInfo');
    },
  } as IrSdkBridge);
}
