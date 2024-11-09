import { BrowserWindow } from 'electron';
import { generateMockData } from './mock-data/mock-data-sender';

export async function publishIRacingSDKEvents() {
  const bridge = generateMockData();
  bridge.onSessionInfo((session) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('sessionInfo', session);
    });
  });
  bridge.onTelemetry((telemetry) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('telemetry', telemetry);
    });
  });
}
