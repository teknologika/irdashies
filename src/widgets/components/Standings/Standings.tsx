import {
  useTelemetry,
  useCurrentSession,
} from '../../context/TelemetryContext';
import { DriverRatingBadge } from './DriverRatingBadge/DriverRatingBadge';
import { DriverInfoRow } from './DriverInfoRow/DriverInfoRow';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import React from 'react';
import { DriverClassHeader } from './DriverClassHeader/DriverClassHeader';
import { SessionBar } from './SessionBar/SessionBar';

export const Standings = () => {
  const [parent] = useAutoAnimate();
  const { session, telemetry } = useTelemetry();
  const currentSession = useCurrentSession();

  if (!session || !telemetry) return <>Waiting for session...</>;

  const numOfClasses = session.WeekendInfo.NumCarClasses;

  if (!currentSession) return <>Waiting for current session...</>;

  const fastestDriverIdx = currentSession.ResultsFastestLap?.[0]?.CarIdx;
  const results =
    currentSession.ResultsPositions ?? session.QualifyResultsInfo?.Results;

  // TODO: refactor all these to utils
  const standings = results
    ?.map((result) => {
      const driver = session.DriverInfo?.Drivers.find(
        (driver) => driver.CarIdx === result.CarIdx
      );

      // race delta
      let delta: number | undefined =
        telemetry.CarIdxF2Time.value?.[result.CarIdx];

      // non-race delta
      if (currentSession.SessionType !== 'Race') {
        const leader = results.find((r) => r.CarIdx === fastestDriverIdx);
        delta = leader ? result.FastestTime - leader.FastestTime : undefined;
        if (delta && delta <= 0) delta = undefined;
      }

      if (!driver) return null;
      return {
        carIdx: result.CarIdx,
        position: result.ClassPosition + 1,
        delta: delta,
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

  if (!standings?.length) return <>Waiting for results...</>;

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

  return (
    <div className="w-full h-full">
      <SessionBar />
      <table className="w-full table-auto text-xs border-separate border-spacing-y-0.5">
        <tbody ref={parent}>
          {sorted.map(([classId, standings]) => (
            <React.Fragment key={classId}>
              <DriverClassHeader
                className={standings[0].carClass.name}
                classColor={standings[0].carClass.color}
              />
              {standings.map((result) => (
                <DriverInfoRow
                  key={result.carIdx}
                  carIdx={result.carIdx}
                  classColor={result.carClass.color}
                  carNumber={result.driver?.carNum || ''}
                  name={result.driver?.name || ''}
                  isPlayer={result.isPlayer}
                  hasFastestTime={result.hasFastestTime}
                  delta={result.delta}
                  position={result.position}
                  lastTime={result.lastTime}
                  fastestTime={result.fastestTime}
                  badge={
                    <DriverRatingBadge
                      license={result.driver?.license}
                      rating={result.driver?.rating}
                    />
                  }
                />
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
