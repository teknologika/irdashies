import type { Session, Telemetry } from '@irdashies/types';
import type { IrSdkBridge } from '../irSdkBridge.type';
import mockTelemetry from './telemetry.json';
import mockSessionInfo from './session.json';

export async function generateMockDataFromPath(
  path?: string
): Promise<IrSdkBridge> {
  if (!path) {
    return generateMockData();
  }

  const telemetry = (await import(/* @vite-ignore */ `${path}/telemetry.json`))
    .default;
  const sessionInfo = (await import(/* @vite-ignore */ `${path}/session.json`))
    .default;

  return generateMockData({
    telemetry,
    sessionInfo,
  });
}

export function generateMockData(sessionData?: {
  telemetry: Telemetry | Telemetry[];
  sessionInfo: Session | Session[];
}): IrSdkBridge {
  let telemetryInterval: NodeJS.Timeout;
  let sessionInfoInterval: NodeJS.Timeout;
  let runningStateInterval: NodeJS.Timeout;

  const telemetry = sessionData?.telemetry;
  const sessionInfo = sessionData?.sessionInfo;

  let telemetryIdx = 0;
  let sessionIdx = 0;

  return {
    onTelemetry: (callback: (value: Telemetry) => void) => {
      telemetryInterval = setInterval(() => {
        let t = Array.isArray(telemetry)
          ? telemetry[telemetryIdx % telemetry.length]
          : telemetry;
        if (!t) {
          t = mockTelemetry as unknown as Telemetry;
          t.CarIdxPosition.value = randomCarPositionSwap(
            t.CarIdxPosition.value
          );
          t.Brake.value[0] = jitterValue(t['Brake'].value[0]);
          t.Throttle.value[0] = jitterValue(t.Throttle.value[0]);
          t.Gear.value[0] = 3;
          t.Speed.value[0] = 44;
        }

        telemetryIdx = telemetryIdx + 1;
        callback({ ...t });
      }, 1000 / 60);
    },
    onSessionData: (callback: (value: Session) => void) => {
      // callback({ ...sessionInfo });
      const updateSessionData = () => {
        let s = Array.isArray(sessionInfo)
          ? sessionInfo[sessionIdx % sessionInfo.length]
          : sessionInfo;

        if (!s) s = mockSessionInfo as unknown as Session;
        sessionIdx = sessionIdx + 1;

        callback(s);
      };
      updateSessionData();
      sessionInfoInterval = setInterval(updateSessionData, 2000);
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

const jitterValue = (value: number): number => {
  return Math.max(0, Math.min(1, value + Math.random() * 0.1 - 0.05));
};

function randomCarPositionSwap<T>(arr: T[]) {
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
