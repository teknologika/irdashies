import { useMemo } from 'react';
import { useSession, useTelemetry } from '../../../context/TelemetryContext';

export const useCurrentSession = () => {
  const { telemetry } = useTelemetry();
  const { session } = useSession();
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
