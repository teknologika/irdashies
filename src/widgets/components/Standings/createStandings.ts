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
  onPitRoad: boolean;
  onTrack: boolean;
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

/**
 * This method will create the driver standings for the current session
 * It will calculate the delta to the leader
 * It will also determine if the driver has the fastest time
 */
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
        onPitRoad: telemetry.CarIdxOnPitRoad?.value?.[result.CarIdx] ?? false,
        onTrack: telemetry.CarIdxTrackSurface?.value?.[result.CarIdx] > -1,
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

/**
 * This method will group the standings by class and sort them by relative speed
 */
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

/**
 * This method will slice up the standings and return only the relevant drivers
 * Top 3 drivers are always included for each class
 * Within the player's class it will include the player and 5 drivers before and after
 */
export const sliceRelevantDrivers = <T extends { isPlayer?: boolean }>(
  groupedStandings: [string, T[]][],
  { buffer = 3 } = {}
): [string, T[]][] => {
  // this is honestly a bit too complicated to maintain so after some testing will
  // probably simplify it so its a bit more readable
  return groupedStandings.map(([classIdx, standings]) => {
    const playerIndex = standings.findIndex((driver) => driver.isPlayer);
    if (playerIndex < 0) {
      // if player is not in this class, return only top 3 drivers in that class
      return [classIdx, standings.slice(0, 3)];
    }

    // if there are less than 10 drivers, return all
    if (standings.length <= 10) return [classIdx, standings];

    // take the player and a buffer of drivers before and after the player
    const start = Math.max(playerIndex - buffer, 0);
    let end = Math.min(playerIndex + buffer + 1, standings.length);

    if (playerIndex <= 3) {
      // if player is in top 3, include more drivers at the end
      end = Math.min(
        playerIndex + buffer + 3 - playerIndex + 1,
        standings.length
      );
    }

    const sliced = standings.slice(start, end);

    if (playerIndex > 3) {
      // add back top 3 but don't include overlapping indexes
      // reverse to add in correct order when doing array unshift
      standings
        .slice(0, 3)
        .reverse()
        .forEach((driver) => {
          if (!sliced.includes(driver)) sliced.unshift(driver);
        });
    }

    return [classIdx, sliced];
  });
};

/**
 * This method will create the standings for the current session
 * It will group the standings by class and slice the relevant drivers
 */
export const createStandings = (
  session?: SessionData,
  telemetry?: TelemetryVarList,
  currentSession?: SessionInfo,
  options?: {
    sliceRelevantDrivers?: {
      buffer?: number;
    };
  }
) => {
  if (!session || !telemetry || !currentSession) return [];

  const standings = createDriverStandings(session, telemetry, currentSession);
  const grouped = groupStandingsByClass(standings);
  return sliceRelevantDrivers(grouped, options?.sliceRelevantDrivers);
};
