import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import type { Session, IrSdkBridge } from '@irdashies/types';

interface SessionContextProps {
  session?: Session;
}

const SessionContext = createContext<SessionContextProps | undefined>(
  undefined
);

export const SessionProvider: React.FC<{
  bridge: IrSdkBridge | Promise<IrSdkBridge>;
  children: ReactNode;
}> = ({ bridge, children }) => {
  const [session, setSession] = useState<Session | undefined>(undefined);
  useEffect(() => {
    if (bridge instanceof Promise) {
      bridge.then((bridge) => {
        bridge.onSessionData((session) => setSession(session));
      });
      return () => bridge.then((bridge) => bridge.stop());
    }

    bridge.onSessionData((session) => setSession(session));
    return () => bridge.stop();
  }, [bridge]);

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextProps => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
