import { InputContainer } from './InputContainer/InputContainer';
import { useTelemetry } from '../TelemetryContext/TelemetryContext';
import { getSingleNumberValue } from '../TelemetryContext/telemetryUtils';

export const Input = () => {
  const { telemetry } = useTelemetry();
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
