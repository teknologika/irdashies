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
        telemetry.CarIdxPosition.value = randomCarPositionSwap(
          telemetry.CarIdxPosition.value
        );
        telemetry.Brake.value[0] = jitterValue(telemetry['Brake'].value[0]);
        telemetry.Throttle.value[0] = jitterValue(telemetry.Throttle.value[0]);
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

function randomCarPositionSwap(arr: number[]) {
  if (arr.length < 2) {
    console.log('Array is too short to swap adjacent elements.');
    return arr;
  }

  // Only swap elements 10% of the time
  if (!(Date.now() % 1000 < 100)) {
    return arr;
  }

  // Generate a random index between 0 and the second-to-last element
  const index = Math.floor(Math.random() * (arr.length - 1));

  // Swap the element at the random index with the next element
  [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];

  return arr;
}
