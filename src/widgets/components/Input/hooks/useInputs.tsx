import { useMemo } from 'react';
import { useTelemetry } from '../../../context/TelemetryContext';

export const useInputs = () => {
  const { telemetry } = useTelemetry();
  const brake = useMemo(
    () => telemetry?.Brake?.value?.[0] ?? 0,
    [telemetry?.Brake?.value]
  );
  const throttle = useMemo(
    () => telemetry?.Throttle?.value?.[0] ?? 0,
    [telemetry?.Throttle?.value]
  );
  const clutch = useMemo(
    () => telemetry?.Clutch?.value?.[0] ?? 0,
    [telemetry?.Clutch?.value]
  );
  const gear = useMemo(
    () => telemetry?.Gear?.value?.[0] ?? 0,
    [telemetry?.Gear?.value]
  );
  const speed = useMemo(
    () => telemetry?.Speed?.value?.[0] ?? 0,
    [telemetry?.Speed?.value]
  );

  return { brake, throttle, clutch, gear, speed };
};
