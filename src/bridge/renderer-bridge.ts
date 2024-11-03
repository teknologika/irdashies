import { contextBridge } from 'electron';
import { ipcRenderer } from 'electron';

export function exposeBridge() {
  contextBridge.exposeInMainWorld('irsdkBridge', {
    onTelemetry: (callback: (value: any) => void) => ipcRenderer.on('telemetry', (_, value) => {
      callback(value);
    }),
    onSessionInfo: (callback: (value: any) => void) => ipcRenderer.on('sessionInfo', (_, value) => {
      callback(value);
    }),
  } as Window['irsdkBridge']);
}
