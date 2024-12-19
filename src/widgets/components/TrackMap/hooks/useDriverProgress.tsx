import { useMemo } from 'react';
import { useSession, useTelemetry } from '../../../context/TelemetryContext';

export const useDriverProgress = () => {
  const { telemetry } = useTelemetry();
  const { session } = useSession();

  const driverIdx = useMemo(() => {
    return session?.DriverInfo?.DriverCarIdx;
  }, [session?.DriverInfo?.DriverCarIdx]);

  const driverTrackPctValue =
    telemetry?.CarIdxLapDistPct?.value[driverIdx ?? 0];
  const driverTrackPct = useMemo(
    () => driverTrackPctValue,
    [driverTrackPctValue]
  );

  return driverTrackPct ?? 0;
};
