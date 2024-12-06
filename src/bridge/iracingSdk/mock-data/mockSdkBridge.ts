import { BrowserWindow } from 'electron';
import { generateMockData } from './generateMockData';
import { TelemetrySink } from '../telemetrySink';

export async function publishIRacingSDKEvents(telemetrySink: TelemetrySink) {
  const bridge = generateMockData();
  bridge.onSessionData((session) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('sessionData', session);
      telemetrySink.addSession(session);
    });
  });
  bridge.onTelemetry((telemetry) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('telemetry', telemetry);
      telemetrySink.addTelemetry(telemetry);
    });
  });
  bridge.onRunningState((running) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('runningState', running);
    });
  });
}
