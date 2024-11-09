import { useTelemetry } from '../TelemetryContext/TelemetryContext';
import { getSingleNumberValue } from '../TelemetryContext/telemetryUtils';
import { DriverRatingBadge } from './DriverRatingBadge/DriverRatingBadge';
import { DriverInfoRow } from './DriverInfoRow/DriverInfoRow';

export const Standings = () => {
  const { session, telemetry } = useTelemetry();
  if (!session) {
    return <></>;
  }

  const currentSessionNum = getSingleNumberValue(telemetry?.SessionNum);
  const currentSession = session?.SessionInfo.Sessions.find(
    (s) => s.SessionNum === currentSessionNum
  );
  const driverResults = currentSession?.ResultsPositions.map((result) => ({
    ...result,
    Driver: session.DriverInfo.Drivers.find(
      (driver) => driver.CarIdx === result.CarIdx
    ),
    Delta: telemetry?.CarIdxF2Time?.value?.[result.CarIdx],
    IsPlayer: result.CarIdx === telemetry?.PlayerCarIdx?.value?.[0],
  }));

  if (!driverResults) {
    return <></>;
  }

  return (
    <div className="bg-slate-900 bg-opacity-50">
      <table className="w-full px-1 table-auto text-xs border-separate border-spacing-x-0 border-spacing-y-1">
        <tbody>
          {driverResults.map((result) => (
            <DriverInfoRow
              key={result.CarIdx}
              carNumber={result.CarIdx}
              name={result.Driver?.UserName || ''}
              isPlayer={result.IsPlayer}
              delta={result.Delta || 0}
              position={result.Position}
              badge={
                <DriverRatingBadge
                  licenseString={result.Driver?.LicString}
                  rating={result.Driver?.IRating}
                />
              }
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
