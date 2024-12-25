import { useMemo } from 'react';
import { useTelemetry } from '../../../context/TelemetryContext';

export const useInputs = () => {
  const { telemetry } = useTelemetry();

  const brakeValue = telemetry?.Brake?.value?.[0] ?? 0;
  const throttleValue = telemetry?.Throttle?.value?.[0] ?? 0;
  const clutchValue = telemetry?.Clutch?.value?.[0] ?? 0;
  const gearValue = telemetry?.Gear?.value?.[0] ?? 0;
  const speedValue = telemetry?.Speed?.value?.[0] ?? 0;

  const brake = useMemo(() => brakeValue, [brakeValue]);
  const throttle = useMemo(() => throttleValue, [throttleValue]);
  const clutch = useMemo(() => clutchValue, [clutchValue]);
  const gear = useMemo(() => gearValue, [gearValue]);
  const speed = useMemo(() => speedValue, [speedValue]);

  return { brake, throttle, clutch, gear, speed };
};
