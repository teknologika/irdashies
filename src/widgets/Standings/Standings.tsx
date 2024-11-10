import { useTelemetry } from '../TelemetryContext/TelemetryContext';
import { DriverRatingBadge } from './DriverRatingBadge/DriverRatingBadge';
import { DriverInfoRow } from './DriverInfoRow/DriverInfoRow';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export const Standings = () => {
  const [parent] = useAutoAnimate();
  const { session, telemetry } = useTelemetry();

  if (!session || !telemetry) return <>Waiting for session...</>;

  const sessions = session.SessionInfo.Sessions;
  const sessionValue = telemetry.SessionNum?.value[0];
  const currentSession = sessions.find((s) => s.SessionNum === sessionValue);

  if (!currentSession) return <>Waiting for current session...</>;

  const standings = currentSession.ResultsPositions.map((result) => {
    const driver = session.DriverInfo.Drivers.find(
      (driver) => driver.CarIdx === result.CarIdx
    );
    return {
      carIdx: result.CarIdx,
      position: result.Position,
      delta: result.Time,
      isPlayer: result.CarIdx === session.DriverInfo.DriverCarIdx,
      driver: driver && {
        name: driver.UserName,
        license: driver.LicString,
        rating: driver.IRating,
      },
    };
  });

  return (
    <div className="bg-slate-900 bg-opacity-50 w-full h-full">
      <table className="w-full px-1 table-auto text-xs border-separate border-spacing-x-0 border-spacing-y-0.5">
        <tbody ref={parent}>
          {standings.map((result) => (
            <DriverInfoRow
              key={result.carIdx}
              carNumber={result.carIdx}
              name={result.driver?.name || ''}
              isPlayer={result.isPlayer}
              delta={result.delta}
              position={result.position}
              badge={
                <DriverRatingBadge
                  license={result.driver?.license}
                  rating={result.driver?.rating}
                />
              }
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
