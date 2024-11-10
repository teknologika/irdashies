declare global {
  interface Window {
    irsdkBridge: import('./bridge/irSdkBridge.type').IrSdkBridge;
  }
}
