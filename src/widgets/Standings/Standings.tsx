import { useTelemetry } from '../TelemetryContext/TelemetryContext';
import { DriverRatingBadge } from './DriverRatingBadge/DriverRatingBadge';
import { DriverInfoRow } from './DriverInfoRow/DriverInfoRow';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export const Standings = () => {
  const { session, telemetry } = useTelemetry();
  if (!session || !telemetry) {
    return <></>;
  }

  const [parent] = useAutoAnimate();

  const standings = telemetry.CarIdxPosition.value
    .filter((carIndex) => carIndex > 0)
    .map((carIndex, position) => {
      const driver = session.DriverInfo.Drivers.find(
        (driver) => driver.CarIdx === carIndex
      );
      return {
        carIdx: carIndex,
        position: position + 1,
        delta: telemetry.CarIdxF2Time.value?.[carIndex],
        isPlayer: carIndex === telemetry.PlayerCarIdx.value?.[0],
        driver: driver && {
          name: driver?.UserName || '',
          license: driver?.LicString,
          rating: driver?.IRating,
        },
      };
    })
    .filter((result) => result.driver);

  return (
    <div className="bg-slate-900 bg-opacity-50">
      <table className="w-full px-1 table-auto text-xs border-separate border-spacing-x-0 border-spacing-y-1">
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
