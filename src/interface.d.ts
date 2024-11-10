declare global {
  interface Window {
    irsdkBridge: import('./bridge/iracingSdk/irSdkBridge.type').IrSdkBridge;
    dashboardBridge: import('./bridge/dashboard/dashboardBridge.type').DashboardBridge;
  }
}
