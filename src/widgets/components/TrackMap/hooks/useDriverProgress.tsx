import { useMemo } from 'react';
import { useSession, useTelemetry } from '../../../context/TelemetryContext';

export const useDriverProgress = () => {
  const { telemetry } = useTelemetry();
  const { session } = useSession();

  const driverIdx = useMemo(() => {
    return session?.DriverInfo?.DriverCarIdx;
  }, [session?.DriverInfo?.DriverCarIdx]);

  const driverIdxValue = telemetry?.CarIdxLapDistPct?.value[driverIdx ?? 0];
  const driverTrackPct = useMemo(() => {
    return driverIdxValue;
  }, [driverIdxValue]);

  return driverTrackPct ?? 0;
};
