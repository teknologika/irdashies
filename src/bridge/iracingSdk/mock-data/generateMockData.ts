import type { Session, Telemetry } from '../types';
import type { IrSdkBridge } from '../irSdkBridge.type';
import mockTelemetry from './telemetry.json';
import mockSessionInfo from './session.json';

export async function generateMockDataFromPath(path?: string) {
  if (!path) {
    return generateMockData();
  }
  const telemetry = await import(/* @vite-ignore */ `${path}/telemetry.json`);
  const sessionInfo = await import(/* @vite-ignore */ `${path}/session.json`);
  return generateMockData({ telemetry, sessionInfo });
}

export function generateMockData(sessionData?: {
  telemetry: Telemetry;
  sessionInfo: Session;
}): IrSdkBridge {
  let telemetryInterval: NodeJS.Timeout;
  let sessionInfoInterval: NodeJS.Timeout;
  let runningStateInterval: NodeJS.Timeout;

  const telemetry =
    sessionData?.telemetry || (mockTelemetry as unknown as Telemetry);
  const sessionInfo =
    sessionData?.sessionInfo || (mockSessionInfo as unknown as Session);

  const jitterValue = (value: number): number => {
    return Math.max(0, Math.min(1, value + Math.random() * 0.1 - 0.05));
  };

  return {
    onTelemetry: (callback: (value: Telemetry) => void) => {
      telemetryInterval = setInterval(() => {
        telemetry.CarIdxPosition.value = randomCarPositionSwap(
          telemetry.CarIdxPosition.value
        );
        telemetry.Brake.value[0] = jitterValue(telemetry['Brake'].value[0]);
        telemetry.Throttle.value[0] = jitterValue(telemetry.Throttle.value[0]);
        telemetry.Gear.value[0] = 3;
        telemetry.Speed.value[0] = 44;
        callback({ ...telemetry });
      }, 1000 / 60);
    },
    onSessionData: (callback: (value: Session) => void) => {
      callback({ ...sessionInfo });
      sessionInfoInterval = setInterval(() => {
        callback({ ...sessionInfo });
      }, 1000);
    },
    onRunningState: (callback: (value: boolean) => void) => {
      runningStateInterval = setInterval(() => {
        callback(true);
      }, 1000);
    },
    stop: () => {
      clearInterval(telemetryInterval);
      clearInterval(sessionInfoInterval);
      clearInterval(runningStateInterval);
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
