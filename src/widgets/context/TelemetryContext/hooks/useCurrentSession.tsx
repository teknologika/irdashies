import { useMemo } from 'react';
import { useTelemetry } from '../TelemetryContext';

export const useCurrentSession = () => {
  const { session, telemetry } = useTelemetry();

  const currentSession = useMemo(() => {
    if (!session || !telemetry?.SessionNum?.value) {
      return null;
    }

    const sessionValue = telemetry.SessionNum.value?.[0] || 0;
    const sessions = session.SessionInfo.Sessions;

    return sessions.find((s) => s.SessionNum === sessionValue) || null;
  }, [session, telemetry]);

  return currentSession;
};
