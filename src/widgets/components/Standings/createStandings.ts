import type {
  SessionData,
  SessionInfo,
  SessionResultsPosition,
  TelemetryVarList,
} from '@irsdk-node/types';

export interface Standings {
  carIdx: number;
  position: number;
  delta?: number;
  isPlayer: boolean;
  driver: {
    name: string;
    carNum: string;
    license: string;
    rating: number;
  };
  fastestTime: number;
  hasFastestTime: boolean;
  lastTime: number;
  carClass: {
    id: number;
    color: number;
    name: string;
    relativeSpeed: number;
  };
}

const calculateDelta = (
  result: SessionResultsPosition,
  telemetry: TelemetryVarList,
  sessionType: string,
  leader: SessionResultsPosition | undefined
): number | undefined => {
  // race delta
  if (sessionType === 'Race') {
    return telemetry.CarIdxF2Time.value?.[result.CarIdx];
  }

  // non-race delta
  let delta = leader ? result.FastestTime - leader.FastestTime : undefined;

  // if delta is negative, set it to undefined then hide from UI
  if (delta && delta <= 0) delta = undefined;

  return delta;
};

const createDriverStandings = (
  session: SessionData & {
    QualifyResultsInfo?: {
      Results: SessionResultsPosition[];
    };
  },
  telemetry: TelemetryVarList,
  currentSession: SessionInfo
): Standings[] => {
  const results =
    currentSession.ResultsPositions ?? session.QualifyResultsInfo?.Results;
  const fastestDriverIdx = currentSession.ResultsFastestLap?.[0]?.CarIdx;
  const fastestDriver = results?.find((r) => r.CarIdx === fastestDriverIdx);

  return results
    ?.map((result) => {
      const driver = session.DriverInfo?.Drivers.find(
        (driver) => driver.CarIdx === result.CarIdx
      );

      if (!driver) return null;
      return {
        carIdx: result.CarIdx,
        position: result.ClassPosition + 1,
        delta: calculateDelta(
          result,
          telemetry,
          currentSession.SessionType,
          fastestDriver
        ),
        isPlayer: result.CarIdx === session.DriverInfo.DriverCarIdx,
        driver: {
          name: driver.UserName,
          carNum: driver.CarNumber,
          license: driver.LicString,
          rating: driver.IRating,
        },
        fastestTime: result.FastestTime,
        hasFastestTime: result.CarIdx === fastestDriverIdx,
        lastTime: result.LastTime,
        carClass: {
          id: driver.CarClassID,
          color: driver.CarClassColor,
          name: driver.CarClassShortName,
          relativeSpeed: driver.CarClassRelSpeed,
        },
      };
    })
    .filter((s) => !!s);
};

const groupStandingsByClass = (standings: Standings[]) => {
  // group by class
  const groupedStandings = standings.reduce(
    (acc, result) => {
      if (!result.carClass) return acc;
      if (!acc[result.carClass.id]) {
        acc[result.carClass.id] = [];
      }
      acc[result.carClass.id].push(result);
      return acc;
    },
    {} as Record<number, typeof standings>
  );

  // sort class by relative speed
  const sorted = Object.entries(groupedStandings).sort(
    ([, a], [, b]) => b[0].carClass.relativeSpeed - a[0].carClass.relativeSpeed
  );
  return sorted;
};

export const createStandings = (
  session: SessionData,
  telemetry: TelemetryVarList,
  currentSession: SessionInfo
) => {
  const standings = createDriverStandings(session, telemetry, currentSession);
  return groupStandingsByClass(standings);
};
