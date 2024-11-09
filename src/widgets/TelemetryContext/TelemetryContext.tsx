import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import type { SessionData, TelemetryVarList } from '@irsdk-node/types';

interface TelemetryContextProps {
  telemetry: TelemetryVarList | null;
  session: SessionData | null;
}

const TelemetryContext = createContext<TelemetryContextProps | undefined>(
  undefined
);

export const TelemetryProvider: React.FC<{
  bridge: typeof window.irsdkBridge;
  children: ReactNode;
}> = ({ bridge, children }) => {
  const [telemetry, setTelemetry] = useState<TelemetryVarList | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    bridge.onTelemetry((telemetry) => setTelemetry(telemetry));
    bridge.onSessionInfo((session) => setSession(session));
    return () => bridge.stop();
  }, [bridge]);

  return (
    <TelemetryContext.Provider value={{ telemetry, session }}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = (): TelemetryContextProps => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};
