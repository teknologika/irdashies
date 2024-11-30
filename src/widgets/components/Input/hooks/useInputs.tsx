import { useMemo } from 'react';
import { useTelemetry } from '../../../context/TelemetryContext';

export const useInputs = () => {
  const { telemetry } = useTelemetry();
  const brake = useMemo(
    () => telemetry?.Brake?.value?.[0] ?? 0,
    [telemetry?.Brake?.value?.[0]]
  );
  const throttle = useMemo(
    () => telemetry?.Throttle?.value?.[0] ?? 0,
    [telemetry?.Throttle?.value?.[0]]
  );
  const clutch = useMemo(
    () => telemetry?.Clutch?.value?.[0] ?? 0,
    [telemetry?.Clutch?.value?.[0]]
  );
  const gear = useMemo(
    () => telemetry?.Gear?.value?.[0] ?? 0,
    [telemetry?.Gear?.value?.[0]]
  );
  const speed = useMemo(
    () => telemetry?.Speed?.value?.[0] ?? 0,
    [telemetry?.Speed?.value?.[0]]
  );

  return { brake, throttle, clutch, gear, speed };
};
