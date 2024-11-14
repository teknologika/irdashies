import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import type { SessionData, TelemetryVarList } from '@irsdk-node/types';
import type { IrSdkBridge } from '../../bridge/iracingSdk/irSdkBridge.type';

interface TelemetryContextProps {
  telemetry?: TelemetryVarList;
  session?: SessionData;
}

const TelemetryContext = createContext<TelemetryContextProps | undefined>(
  undefined
);

export const TelemetryProvider: React.FC<{
  bridge: IrSdkBridge;
  children: ReactNode;
}> = ({ bridge, children }) => {
  const [session, setSession] = useState<SessionData | undefined>(undefined);
  const [telemetry, setTelemetry] = useState<TelemetryVarList | undefined>(
    undefined
  );

  useEffect(() => {
    bridge.onTelemetry((telemetry) => setTelemetry(telemetry));
    bridge.onSessionData((session) => setSession(session));
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
