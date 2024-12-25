import { useTelemetry } from '@irdashies/context';
import { useCurrentSession } from './useCurrentSession';
import { useMemo } from 'react';

export const useSessionLapCount = () => {
  const { telemetry } = useTelemetry();
  const currentSession = useCurrentSession();

  const current = telemetry?.RaceLaps?.value?.[0] || 0;
  const timeRemaining = telemetry?.SessionTimeTotal?.value?.[0] || 0;
  const timeElapsed = telemetry?.SessionTimeRemain?.value?.[0] || 0;

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

    result.current = current;
    result.timeRemaining = timeRemaining;
    result.timeElapsed = timeElapsed;

    return result;
  }, [currentSession?.SessionLaps, current, timeRemaining, timeElapsed]);

  return result;
};
