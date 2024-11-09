import mockTelemetry from './telemetry.json';
import mockSessionInfo from './session.json';
import type { SessionData, TelemetryVarList } from '@irsdk-node/types';

export function generateMockData(): typeof window.irsdkBridge {
  const telemetry = mockTelemetry as unknown as TelemetryVarList;
  const sessionInfo = mockSessionInfo as unknown as SessionData;

  let telemetryInterval: NodeJS.Timeout;
  let sessionInfoInterval: NodeJS.Timeout;

  const jitterValue = (value: number): number => {
    return Math.max(0, Math.min(1, value + Math.random() * 0.1 - 0.05));
  };

  return {
    onTelemetry: (callback: (value: TelemetryVarList) => void) => {
      telemetryInterval = setInterval(() => {
        telemetry['Brake'].value[0] = jitterValue(telemetry['Brake'].value[0]);
        telemetry['Throttle'].value[0] = jitterValue(
          telemetry['Throttle'].value[0]
        );
        callback({ ...telemetry });
      }, 1000 / 60);
    },
    onSessionInfo: (callback: (value: SessionData) => void) => {
      callback({ ...sessionInfo });
      sessionInfoInterval = setInterval(() => {
        callback({ ...sessionInfo });
      }, 1000);
    },
    stop: () => {
      clearInterval(telemetryInterval);
      clearInterval(sessionInfoInterval);
    },
  };
}
