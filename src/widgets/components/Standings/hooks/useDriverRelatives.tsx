import { useMemo } from 'react';
import { useTelemetry } from '../../../context/TelemetryContext';
import { useDriverStandings, usePlayerCarIndex } from './useDriverPositions';

export const useDriverRelatives = ({ buffer }: { buffer: number }) => {
  const { telemetry, session } = useTelemetry();
  const driverStandings = useDriverStandings();
  const playerIndex = usePlayerCarIndex();

  const standings = useMemo(() => {
    const standings = driverStandings;
    const lapDistPctCarIdx = telemetry?.CarIdxLapDistPct?.value ?? [];
    const relativeCarIdx = telemetry?.CarIdxEstTime?.value ?? [];
    const player = session?.DriverInfo.Drivers.find(
      (result) => result.CarIdx === session?.DriverInfo?.DriverCarIdx
    );

    const relatives = standings
      .map((result) => {
        // driver class estimate lap time
        const driver = session?.DriverInfo?.Drivers.find(
          (d) => d.CarIdx === result.carIdx
        );
        const lapTimeEst = driver?.CarClassEstLapTime;

        let delta = 0.0;
        const driverLapTimeEst = lapTimeEst ?? 0;
        const relativeCarTime = relativeCarIdx[result.carIdx];
        const playerCarTime = relativeCarIdx[player?.CarIdx ?? 0];

        // Determine if the delta between player and relative car spans across the start/finish line
        const crossesStartFinishLine =
          Math.abs(
            lapDistPctCarIdx[result.carIdx] -
              lapDistPctCarIdx[player?.CarIdx ?? 0]
          ) > 0.5;

        if (crossesStartFinishLine) {
          delta =
            playerCarTime > relativeCarTime
              ? relativeCarTime - playerCarTime + driverLapTimeEst
              : relativeCarTime - playerCarTime - driverLapTimeEst;
        } else {
          delta = relativeCarTime - playerCarTime;
        }

        return {
          ...result,
          delta,
        };
      })
      .sort((a, b) => b.delta - a.delta);

    // slice the relevant drivers based on the buffer
    const tableIndex = relatives.findIndex(
      (result) => result.carIdx === playerIndex
    );

    const end = Math.min(tableIndex + buffer + 1, relatives.length);
    const start = Math.max(tableIndex - buffer, 0);
    const sliced = relatives.slice(start, end);

    return sliced;
  }, [
    driverStandings,
    telemetry?.CarIdxLapDistPct?.value,
    telemetry?.CarIdxEstTime?.value,
    session?.DriverInfo.Drivers,
    session?.DriverInfo?.DriverCarIdx,
    buffer,
    playerIndex,
  ]);

  return standings;
};
