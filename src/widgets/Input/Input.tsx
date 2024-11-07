import { InputContainer } from './InputContainer/InputContainer';
import { useTelemetry } from '../TelemetryContext/TelemetryContext';
import { getSingleNumberValue } from '../TelemetryContext/telemetryUtils';

export const Input = () => {
  const { telemetryData } = useTelemetry();
  return (
    <InputContainer
      brake={getSingleNumberValue(telemetryData?.Brake)}
      throttle={getSingleNumberValue(telemetryData?.Throttle)}
      clutch={getSingleNumberValue(telemetryData?.Clutch)}
      gear={getSingleNumberValue(telemetryData?.Gear)}
      speed={getSingleNumberValue(telemetryData?.Speed)}
    />
  );
};
