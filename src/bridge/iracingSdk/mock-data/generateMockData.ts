import type { SessionData, TelemetryVarList } from '@irsdk-node/types';
import type { IrSdkBridge } from '../irSdkBridge.type';
import mockTelemetry from './telemetry.json';
import mockSessionInfo from './session.json';

export async function generateMockDataFromPath(path: string) {
  const telemetry = await import(`./${path}/telemetry.json`);
  const sessionInfo = await import(`./${path}/session.json`);
  return generateMockData({ telemetry, sessionInfo });
}

export function generateMockData(sessionData?: {
  telemetry: TelemetryVarList;
  sessionInfo: SessionData;
}): IrSdkBridge {
  let telemetryInterval: NodeJS.Timeout;
  let sessionInfoInterval: NodeJS.Timeout;
  let runningStateInterval: NodeJS.Timeout;

  const telemetry =
    sessionData?.telemetry || (mockTelemetry as unknown as TelemetryVarList);
  const sessionInfo =
    sessionData?.sessionInfo || (mockSessionInfo as unknown as SessionData);

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
        telemetry.Gear.value[0] = 3;
        telemetry.Speed.value[0] = 44;
        callback({ ...telemetry });
      }, 1000 / 60);
    },
    onSessionData: (callback: (value: SessionData) => void) => {
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
