import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import type { Telemetry, IrSdkBridge } from '@irdashies/types';

interface TelemetryContextProps {
  telemetry?: Telemetry;
}

const TelemetryContext = createContext<TelemetryContextProps | undefined>(
  undefined
);

export const TelemetryProvider: React.FC<{
  bridge: IrSdkBridge | Promise<IrSdkBridge>;
  children: ReactNode;
}> = ({ bridge, children }) => {
  const [telemetry, setTelemetry] = useState<Telemetry | undefined>(undefined);

  useEffect(() => {
    if (bridge instanceof Promise) {
      bridge.then((bridge) => {
        bridge.onTelemetry((telemetry) => setTelemetry(telemetry));
      });
      return () => bridge.then((bridge) => bridge.stop());
    }

    bridge.onTelemetry((telemetry) => setTelemetry(telemetry));
    return () => bridge.stop();
  }, [bridge]);

  return (
    <TelemetryContext.Provider value={{ telemetry }}>
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
