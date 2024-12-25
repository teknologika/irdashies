declare global {
  interface Window {
    irsdkBridge: import('@irdashies/types').IrSdkBridge;
    dashboardBridge: import('@irdashies/types').DashboardBridge;
  }
}
