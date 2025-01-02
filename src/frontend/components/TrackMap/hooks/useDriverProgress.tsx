import { useDriverCarIdx, useTelemetryStore } from '@irdashies/context';

export const useDriverProgress = () => {
  const driverIdx = useDriverCarIdx();
  const driverTrackPctValue = useTelemetryStore((s) => {
    const val = s.telemetry?.CarIdxLapDistPct?.value[driverIdx ?? 0];
    // round to nearest 0.01
    return val ? Math.round(val * 100) / 100 : 0;
  });
  return driverTrackPctValue ?? 0;
};
