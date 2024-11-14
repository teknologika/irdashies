import { BrowserWindow } from 'electron';
import { generateMockData } from './generateMockData';

export async function publishIRacingSDKEvents() {
  const bridge = generateMockData();
  bridge.onSessionData((session) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('sessionData', session);
    });
  });
  bridge.onTelemetry((telemetry) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('telemetry', telemetry);
    });
  });
  bridge.onRunningState((running) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('runningState', running);
    });
  });
}
