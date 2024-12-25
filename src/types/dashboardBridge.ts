import { DashboardLayout } from '../app/storage/dashboards';

export interface DashboardBridge {
  onEditModeToggled: (callback: (value: boolean) => void) => void;
  dashboardUpdated: (callback: (value: DashboardLayout) => void) => void;
  reloadDashboard: () => void;
  saveDashboard: (value: DashboardLayout) => void;
}
