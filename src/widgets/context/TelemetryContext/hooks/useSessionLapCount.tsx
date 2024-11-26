import { useTelemetry } from '../TelemetryContext';
import { useCurrentSession } from './useCurrentSession';

export const useSessionLapCount = () => {
  const { telemetry } = useTelemetry();
  const currentSession = useCurrentSession();
  const result = {
    current: 0,
    total: 0,
    timeElapsed: 0,
    timeRemaining: 0,
  };

  if (!currentSession || !telemetry) {
    return result;
  }

  if (typeof currentSession.SessionLaps === 'number') {
    result.total = currentSession.SessionLaps;
  }

  result.current = telemetry.RaceLaps.value?.[0] || 0;
  result.timeRemaining = telemetry.SessionTimeTotal.value?.[0] || 0;
  result.timeElapsed = telemetry.SessionTimeRemain.value?.[0] || 0;

  return result;
};
