import { DashboardLayout } from '../../storage/dashboards';

export interface DashboardBridge {
  dashboardUpdated: (callback: (value: DashboardLayout) => void) => void;
  reloadDashboard: () => void;
  saveDashboard: (value: DashboardLayout) => void;
}
