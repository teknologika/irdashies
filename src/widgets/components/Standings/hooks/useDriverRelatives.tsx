import { useMemo } from 'react';
import { useTelemetry } from '../../../context/TelemetryContext';
import { createDriverStandings } from '../createStandings';
import { useCurrentSession } from './useCurrentSession';

export const useDriverRelatives = ({ buffer }: { buffer: number }) => {
  const { telemetry, session } = useTelemetry();
  const currentSession = useCurrentSession();

  const standings = useMemo(() => {
    const standings = createDriverStandings(
      {
        playerIdx: session?.DriverInfo?.DriverCarIdx,
        drivers: session?.DriverInfo?.Drivers,
        qualifyingResults: session?.QualifyResultsInfo?.Results,
      },
      {
        carIdxF2TimeValue: telemetry?.CarIdxF2Time?.value,
        carIdxOnPitRoadValue: telemetry?.CarIdxOnPitRoad?.value,
        carIdxTrackSurfaceValue: telemetry?.CarIdxTrackSurface?.value,
        radioTransmitCarIdx: telemetry?.RadioTransmitCarIdx?.value,
      },
      {
        resultsPositions: currentSession?.ResultsPositions,
        resultsFastestLap: currentSession?.ResultsFastestLap,
        sessionType: currentSession?.SessionType,
      }
    );

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
      .sort((a, b) => a.delta - b.delta);

    // slice the relevant drivers based on the buffer
    const playerIndex = relatives.findIndex(
      (result) => result.carIdx === session?.DriverInfo?.DriverCarIdx
    );

    const end = Math.min(playerIndex + buffer + 1, relatives.length);
    const start = Math.max(playerIndex - buffer, 0);
    const sliced = relatives.slice(start, end);

    return sliced;
  }, [
    session?.DriverInfo?.DriverCarIdx,
    session?.DriverInfo?.Drivers,
    session?.QualifyResultsInfo?.Results,
    telemetry?.CarIdxF2Time?.value,
    telemetry?.CarIdxOnPitRoad?.value,
    telemetry?.CarIdxTrackSurface?.value,
    telemetry?.RadioTransmitCarIdx?.value,
    telemetry?.CarIdxEstTime?.value,
    telemetry?.CarIdxLapDistPct?.value,
    currentSession?.ResultsPositions,
    currentSession?.ResultsFastestLap,
    currentSession?.SessionType,
    buffer,
  ]);

  return standings;
};
