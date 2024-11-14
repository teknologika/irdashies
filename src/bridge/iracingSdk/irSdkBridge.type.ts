import type { SessionData, TelemetryVarList } from '@irsdk-node/types';

export interface IrSdkBridge {
  onTelemetry: (callback: (value: TelemetryVarList) => void) => void;
  onSessionData: (callback: (value: SessionData) => void) => void;
  onRunningState: (callback: (value: boolean) => void) => void;
  stop: () => void;
}
