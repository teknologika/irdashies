import { useMemo } from 'react';
import { useTelemetry } from '../../../context/TelemetryContext';
import { Standings } from '../createStandings';
import { useCurrentSession } from './useCurrentSession';

export const useDriverPositions = () => {
  const { telemetry } = useTelemetry();

  const driverPositions = useMemo(() => {
    const carIdxPosition = telemetry?.CarIdxPosition?.value ?? [];
    const carIdxClassPosition = telemetry?.CarIdxClassPosition?.value ?? [];
    const carIdxBestLap = telemetry?.CarIdxBestLapTime?.value ?? [];
    const carIdxLastLap = telemetry?.CarIdxLastLapTime?.value ?? [];
    const carIdxF2Time = telemetry?.CarIdxF2Time?.value ?? [];
    const carIdxLapNum = telemetry?.CarIdxLap?.value ?? [];

    const positions = carIdxPosition.map((position, carIdx) => ({
      carIdx,
      position,
      classPosition: carIdxClassPosition[carIdx],
      delta: carIdxF2Time[carIdx], // only to leader currently, need to handle non-race sessions
      bestLap: carIdxBestLap[carIdx],
      lastLap: carIdxLastLap[carIdx],
      lapNum: carIdxLapNum[carIdx],
    }));

    return positions;
  }, [telemetry]);

  return driverPositions;
};

export const useDrivers = () => {
  const { session } = useTelemetry();

  const drivers = useMemo(() => {
    const driverInfo = session?.DriverInfo?.Drivers ?? [];
    return driverInfo.map((driver) => ({
      carIdx: driver.CarIdx,
      name: driver.UserName,
      carNum: driver.CarNumber,
      carNumRaw: driver.CarNumberRaw,
      license: driver.LicString,
      rating: driver.IRating,
      carClass: {
        id: driver.CarClassID,
        color: driver.CarClassColor,
        name: driver.CarClassShortName,
        relativeSpeed: driver.CarClassRelSpeed,
      },
    }));
  }, [session]);

  return drivers;
};

// Which car is currently active on radio
export const useRadioTransmitCarIndex = () => {
  const { telemetry } = useTelemetry();

  const radioTransmitCarIdx = useMemo(() => {
    const radioTransmitCarIdx = telemetry?.RadioTransmitCarIdx?.value ?? [];
    if (!radioTransmitCarIdx.length) return undefined;

    return radioTransmitCarIdx[0];
  }, [telemetry?.RadioTransmitCarIdx?.value]);

  return radioTransmitCarIdx;
};

export const useCarState = () => {
  const { telemetry } = useTelemetry();

  const trackSurfacesCarIndexes = useMemo(() => {
    const carIndexes = telemetry?.CarIdxTrackSurface?.value ?? [];
    return carIndexes.map((value) => value > -1);
  }, [telemetry?.CarIdxTrackSurface?.value]);

  const pitRoadCarIndexes = useMemo(() => {
    const carIndexes = telemetry?.CarIdxOnPitRoad?.value ?? [];
    return carIndexes;
  }, [telemetry?.CarIdxOnPitRoad?.value]);

  // turn two arrays to one array with object of index and boolean values
  return trackSurfacesCarIndexes.map((onTrack, index) => ({
    carIdx: index,
    onTrack,
    onPitRoad: pitRoadCarIndexes[index],
  }));
};

export const usePlayerCarIndex = () => {
  const { session } = useTelemetry();

  const playerCarIdx = useMemo(() => {
    return session?.DriverInfo?.DriverCarIdx;
  }, [session?.DriverInfo?.DriverCarIdx]);

  return playerCarIdx;
};

// TODO: this should eventually replace the useDriverStandings hook
// currently there's still a few bugs to handle but is only used in relative right now
export const useDriverStandings = () => {
  const driverPositions = useDriverPositions();
  const drivers = useDrivers();
  const radioTransmitCarIdx = useRadioTransmitCarIndex();
  const carStates = useCarState();
  const playerCarIdx = usePlayerCarIndex();
  const currentSession = useCurrentSession();

  const driverStandings: Standings[] = useMemo(() => {
    const standings = drivers.map((driver) => {
      const driverPos = driverPositions.find(
        (driverPos) => driverPos.carIdx === driver.carIdx
      );

      if (!driverPos) return undefined;

      const carState = carStates.find((car) => car.carIdx === driver.carIdx);
      const playerLap =
        driverPositions.find((pos) => pos.carIdx === playerCarIdx)?.lapNum ?? 0;

      let lappedState: 'ahead' | 'behind' | 'same' | undefined = undefined;
      if (currentSession?.SessionType === 'Race') {
        if (driverPos.lapNum > playerLap) lappedState = 'ahead';
        if (driverPos.lapNum < playerLap) lappedState = 'behind';
        if (driverPos.lapNum === playerLap) lappedState = 'same';
      }

      // If the driver is not in the standings, use the car number as position
      // This is a crappy workaround for drivers that are not in the standings
      // carIdx is also not available in qualifying (might be just lone qualifying thing)
      let classPosition = driverPos.position;
      if (classPosition <= 0) classPosition = driver.carIdx || driver.carNumRaw;

      return {
        carIdx: driver.carIdx,
        position: driverPos.position,
        lap: driverPos.lapNum,
        lappedState,
        classPosition,
        delta: driverPos.delta,
        isPlayer: playerCarIdx === driver.carIdx,
        driver: {
          name: driver.name,
          carNum: driver.carNum,
          license: driver.license,
          rating: driver.rating,
        },
        fastestTime: driverPos.bestLap,
        hasFastestTime: false, // TODO
        lastTime: driverPos.lastLap,
        onPitRoad: carState?.onPitRoad ?? false,
        onTrack: carState?.onTrack ?? false,
        carClass: driver.carClass,
        radioActive: driverPos.carIdx === radioTransmitCarIdx,
      };
    });

    return standings.filter((s) => !!s).sort((a, b) => a.position - b.position);
  }, [
    carStates,
    currentSession?.SessionType,
    driverPositions,
    drivers,
    playerCarIdx,
    radioTransmitCarIdx,
  ]);

  return driverStandings;
};
