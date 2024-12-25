import type { DashboardLayout, DashboardWidget } from '@irdashies/types';
import { emitDashboardUpdated } from './dashboardEvents';
import { defaultDashboard } from './defaultDashboard';
import { readData, writeData } from './storage';

const DASHBOARDS_KEY = 'dashboards';

export const getOrCreateDefaultDashboard = () => {
  const dashboard = getDashboard('default');
  if (dashboard) {
    // check missing widgets
    const missingWidgets = defaultDashboard.widgets.filter(
      (defaultWidget) =>
        !dashboard.widgets.find((widget) => widget.id === defaultWidget.id)
    );

    if (!missingWidgets.length) {
      return dashboard;
    }

    // add missing widgets and save
    const updatedDashboard = {
      widgets: [...dashboard.widgets, ...missingWidgets],
    };
    saveDashboard('default', updatedDashboard);
    return updatedDashboard;
  }

  saveDashboard('default', defaultDashboard);

  return defaultDashboard;
};

export const listDashboards = () => {
  const dashboards = readData<Record<string, DashboardLayout>>(DASHBOARDS_KEY);
  if (!dashboards) return {};

  return dashboards;
};

export const getDashboard = (id: string) => {
  const dashboards = readData<Record<string, DashboardLayout>>(DASHBOARDS_KEY);
  if (!dashboards) return null;

  return dashboards[id];
};

export const updateDashboardWidget = (
  updatedWidget: DashboardWidget,
  dashboardId = 'default'
) => {
  const dashboard = getDashboard(dashboardId);
  if (!dashboard) {
    throw new Error('Default dashboard not found');
  }

  const updatedDashboard = {
    widgets: dashboard.widgets.map((existingWidget) =>
      existingWidget.id === updatedWidget.id ? updatedWidget : existingWidget
    ),
  };

  saveDashboard(dashboardId, updatedDashboard);
};

export const saveDashboard = (
  id: string | 'default',
  value: DashboardLayout
) => {
  const dashboards = listDashboards();
  dashboards[id] = value;
  writeData(DASHBOARDS_KEY, dashboards);
  emitDashboardUpdated(value);
};
