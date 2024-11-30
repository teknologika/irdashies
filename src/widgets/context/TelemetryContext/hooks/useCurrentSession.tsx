import { useMemo } from 'react';
import { useTelemetry } from '../TelemetryContext';

export const useCurrentSession = () => {
  const { session, telemetry } = useTelemetry();
  const currentSession = useMemo(() => {
    if (!session?.SessionInfo?.Sessions || !telemetry?.SessionNum?.value) {
      return undefined;
    }

    const sessionValue = telemetry.SessionNum.value?.[0] || 0;
    const sessions = session.SessionInfo.Sessions;

    return sessions.find((s) => s.SessionNum === sessionValue) || undefined;
  }, [session?.SessionInfo?.Sessions, telemetry?.SessionNum?.value]);

  return currentSession;
};
