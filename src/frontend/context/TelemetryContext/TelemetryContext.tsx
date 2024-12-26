import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import type { Session, Telemetry, IrSdkBridge } from '@irdashies/types';

interface TelemetryContextProps {
  telemetry?: Telemetry;
}

interface SessionContextProps {
  session?: Session;
}

const TelemetryContext = createContext<TelemetryContextProps | undefined>(
  undefined
);

const SessionContext = createContext<SessionContextProps | undefined>(
  undefined
);

export const TelemetryProvider: React.FC<{
  bridge: IrSdkBridge | Promise<IrSdkBridge>;
  children: ReactNode;
}> = ({ bridge, children }) => {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [telemetry, setTelemetry] = useState<Telemetry | undefined>(undefined);

  useEffect(() => {
    if (bridge instanceof Promise) {
      bridge.then((bridge) => {
        bridge.onTelemetry((telemetry) => setTelemetry(telemetry));
        bridge.onSessionData((session) => setSession(session));
      });
      return () => bridge.then((bridge) => bridge.stop());
    }

    bridge.onTelemetry((telemetry) => setTelemetry(telemetry));
    bridge.onSessionData((session) => setSession(session));
    return () => bridge.stop();
  }, [bridge]);

  return (
    <SessionContext.Provider value={{ session }}>
      <TelemetryContext.Provider value={{ telemetry }}>
        {children}
      </TelemetryContext.Provider>
    </SessionContext.Provider>
  );
};

export const useTelemetry = (): TelemetryContextProps => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};

export const useSession = (): SessionContextProps => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};
