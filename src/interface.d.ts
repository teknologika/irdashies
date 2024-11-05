export interface IrSdkBridge {
  onTelemetry: (callback: (value: TelemetryVarList) => void) => void;
  onSessionInfo: (callback: (value: TelemetryVarList) => void) => void;
}

declare global {
  interface Window {
    irsdkBridge: IrSdkBridge;
  }
}
