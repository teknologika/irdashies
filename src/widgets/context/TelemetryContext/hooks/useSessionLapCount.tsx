import { useTelemetry } from '../TelemetryContext';
import { useCurrentSession } from './useCurrentSession';
import { useMemo } from 'react';

export const useSessionLapCount = () => {
  const { telemetry } = useTelemetry();
  const currentSession = useCurrentSession();

  const result = useMemo(() => {
    const result = {
      current: 0,
      total: 0,
      timeElapsed: 0,
      timeRemaining: 0,
    };

    if (!currentSession?.SessionLaps) {
      return result;
    }

    if (typeof currentSession.SessionLaps === 'number') {
      result.total = currentSession.SessionLaps;
    }

    result.current = telemetry?.RaceLaps?.value?.[0] || 0;
    result.timeRemaining = telemetry?.SessionTimeTotal?.value?.[0] || 0;
    result.timeElapsed = telemetry?.SessionTimeRemain?.value?.[0] || 0;

    return result;
  }, [
    currentSession?.SessionLaps,
    telemetry?.RaceLaps?.value,
    telemetry?.SessionTimeTotal?.value,
    telemetry?.SessionTimeRemain?.value,
  ]);

  return result;
};
