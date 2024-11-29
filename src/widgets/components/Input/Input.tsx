import { InputContainer } from './InputContainer/InputContainer';
import { useTelemetry } from '../../context/TelemetryContext/TelemetryContext';
import { useCallback } from 'react';

export const Input = () => {
  const { telemetry } = useTelemetry();
  const getSingleNumberValue = useCallback(
    (telemetryValue?: { value: number[] }) => telemetryValue?.value?.[0] ?? 0,
    []
  );

  return (
    <InputContainer
      brake={getSingleNumberValue(telemetry?.Brake)}
      throttle={getSingleNumberValue(telemetry?.Throttle)}
      clutch={getSingleNumberValue(telemetry?.Clutch)}
      gear={getSingleNumberValue(telemetry?.Gear)}
      speed={getSingleNumberValue(telemetry?.Speed)}
    />
  );
};
