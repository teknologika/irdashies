export interface IrSdkBridge {
  onTelemetry: (callback: (value: any) => void) => void;
  onSessionInfo: (callback: (value: any) => void) => void;
}

declare global {
  interface Window {
    irsdkBridge: IrSdkBridge;
  }
}
