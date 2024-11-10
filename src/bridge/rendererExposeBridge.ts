import { contextBridge, ipcMain, ipcRenderer } from 'electron';
import type { TelemetryVarList, SessionData } from '@irsdk-node/types';
import type { IrSdkBridge } from './iracingSdk/irSdkBridge.type';
import { DashboardLayout, getDashboard } from '../storage/dashboards';
import { DashboardBridge } from './dashboard/dashboardBridge.type';

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

  contextBridge.exposeInMainWorld('dashboardBridge', {
    reloadDashboard: () => {
      ipcRenderer.send('reloadDashboard');
    },
    dashboardUpdated: (callback: (value: DashboardLayout) => void) => {
      ipcRenderer.on('dashboardUpdated', (_, value) => {
        callback(value);
      });
    },
    saveDashboard: (value: DashboardLayout) => {
      ipcRenderer.send('saveDashboard', value);
    },
  } as DashboardBridge);
}
