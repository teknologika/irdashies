import { BrowserWindow } from 'electron';
import mockTelemetry from './mock-data/telemetry.json';
import type { TelemetryVarList } from '@irsdk-node/types';

export async function mockIRacingSDKEvents(window: BrowserWindow) {
  const telemetry = mockTelemetry as unknown as TelemetryVarList;

  setInterval(() => {
    telemetry['Brake'].value[0] = Math.max(
      0,
      Math.min(1, telemetry['Brake'].value[0] + Math.random() * 0.1 - 0.05),
    );
    telemetry['Throttle'].value[0] = Math.max(
      0,
      Math.min(1, telemetry['Throttle'].value[0] + Math.random() * 0.1 - 0.05),
    );

    window.webContents.send('telemetry', telemetry);
  }, 1000 / 60);
}
