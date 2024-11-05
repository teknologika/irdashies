import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import type { TelemetryVarList } from '@irsdk-node/types';

interface TelemetryContextProps {
  telemetryData: TelemetryVarList | null;
}

const TelemetryContext = createContext<TelemetryContextProps | undefined>(
  undefined
);

export const TelemetryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [telemetryData, setTelemetryData] = useState<TelemetryVarList | null>(
    null
  );

  useEffect(() => {
    const bridge = window.irsdkBridge;
    bridge.onTelemetry((telemetry: TelemetryVarList) => {
      setTelemetryData(telemetry);
    });
  }, []);

  return (
    <TelemetryContext.Provider value={{ telemetryData }}>
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

export const withTelemetry = (Component: React.FC) => {
  return () => (
    <TelemetryProvider>
      <Component />
    </TelemetryProvider>
  );
};
