import type { DashboardBridge, IrSdkBridge } from '@irdashies/types';
import type { HttpServerBridge } from './app/bridge/httpServerBridge';

declare global {
  interface Window {
    irsdkBridge: IrSdkBridge;
    dashboardBridge: DashboardBridge;
    httpServerBridge: HttpServerBridge;
  }
}
