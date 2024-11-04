import { BrowserWindow } from 'electron';
import mockTelemetry from './mock-data/telemetry.json';
import type { TelemetryVarList } from '@irsdk-node/types';

export async function mockIRacingSDKEvents(window: BrowserWindow) {
  const telemetry = [mockTelemetry] as unknown as TelemetryVarList[];
  let index = 0;

  setInterval(() => {
    window.webContents.send('telemetry', telemetry[index]);
    index = (index + 1) % telemetry.length;
  }, 1000 / 60);
}
