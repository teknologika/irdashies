import type { TelemetryVariable } from '@irsdk-node/types';

export const getSingleNumberValue = (
  telemetryValue: TelemetryVariable<number[]> | undefined
) => {
  return telemetryValue?.value?.[0] ?? 0;
};
