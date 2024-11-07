import { defaultDashboard } from './defaultDashboard';
import { readData, writeData } from './storage';

const DASHBOARDS_KEY = 'dashboards';

export interface WidgetLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DashboardWidget {
  id: string;
  layout: WidgetLayout;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
}

export const createDefaultDashboardIfNotExists = () => {
  const dashboards = listDashboards();
  if (Object.keys(dashboards).length) return;

  saveDashboard('default', defaultDashboard);
};

export const listDashboards = () => {
  const dashboards = readData<Record<string, DashboardLayout>>(DASHBOARDS_KEY);
  if (!dashboards) return {};

  return dashboards;
};

export const getDashboard = (id: string) => {
  const dashboards = readData<Record<string, DashboardLayout>>(DASHBOARDS_KEY);
  if (!dashboards) return undefined;

  return dashboards[id];
};

export const saveDashboard = (
  id: string | 'default',
  value: DashboardLayout
) => {
  const dashboards = listDashboards();
  dashboards[id] = value;
  writeData(DASHBOARDS_KEY, dashboards);
};
