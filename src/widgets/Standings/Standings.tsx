import { useTelemetry } from '../TelemetryContext/TelemetryContext';
import { DriverRatingBadge } from './DriverRatingBadge/DriverRatingBadge';
import { DriverInfoRow } from './DriverInfoRow/DriverInfoRow';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import React from 'react';
import { DriverClassHeader } from './DriverClassHeader/DriverClassHeader';

export const Standings = () => {
  const [parent] = useAutoAnimate();
  const { session, telemetry } = useTelemetry();

  if (!session || !telemetry) return <>Waiting for session...</>;

  const sessions = session.SessionInfo.Sessions;
  const sessionValue = telemetry.SessionNum?.value[0] || 0;
  const currentSession = sessions.find((s) => s.SessionNum === sessionValue);
  const numOfClasses = session.WeekendInfo.NumCarClasses;

  if (!currentSession) return <>Waiting for current session...</>;

  const standings = currentSession.ResultsPositions.map((result) => {
    const driver = session.DriverInfo.Drivers.find(
      (driver) => driver.CarIdx === result.CarIdx
    );
    if (!driver) return null;
    return {
      carIdx: result.CarIdx,
      position: result.ClassPosition + 1,
      delta: result.Time,
      isPlayer: result.CarIdx === session.DriverInfo.DriverCarIdx,
      driver: {
        name: driver.UserName,
        carNum: driver.CarNumber,
        license: driver.LicString,
        rating: driver.IRating,
      },
      fastestTime: result.FastestTime,
      lastTime: result.LastTime,
      carClass: {
        id: driver.CarClassID,
        color: driver.CarClassColor,
        name: driver.CarClassShortName,
        relativeSpeed: driver.CarClassRelSpeed,
      },
    };
  }).filter((s) => !!s);

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

  const sorted = Object.entries(groupedStandings).sort(
    ([, a], [, b]) => b[0].carClass.relativeSpeed - a[0].carClass.relativeSpeed
  );

  return (
    <div className="bg-opacity-50 w-full h-full">
      <table className="w-full px-1 table-auto text-xs border-separate border-spacing-y-0.5">
        <tbody ref={parent}>
          {sorted.map(([classId, standings], classIdx) => (
            <React.Fragment key={classId}>
              {numOfClasses > 1 && (
                <DriverClassHeader
                  className={standings[0].carClass.name}
                  classIdx={classIdx}
                />
              )}
              {standings.map((result) => (
                <DriverInfoRow
                  key={result.carIdx}
                  carIdx={result.carIdx}
                  classIdx={classIdx}
                  carNumber={result.driver?.carNum || ''}
                  name={result.driver?.name || ''}
                  isPlayer={result.isPlayer}
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
