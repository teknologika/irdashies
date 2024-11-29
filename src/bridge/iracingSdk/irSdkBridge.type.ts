import type { Session, Telemetry } from './types';

export interface IrSdkBridge {
  onTelemetry: (callback: (value: Telemetry) => void) => void;
  onSessionData: (callback: (value: Session) => void) => void;
  onRunningState: (callback: (value: boolean) => void) => void;
  stop: () => void;
}
