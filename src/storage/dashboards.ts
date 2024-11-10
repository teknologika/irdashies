import { emitDashboardUpdated } from './dashboardEvents';
import { defaultDashboard } from './defaultDashboard';
import { readData, writeData } from './storage';

const DASHBOARDS_KEY = 'dashboards';

/**
 * Represents the layout of a widget on a dashboard.
 */
export interface WidgetLayout {
  /** The window x position of the widget. */
  x: number;
  /** The window y position of the widget. */
  y: number;
  /** The window width of the widget */
  width: number;
  /** The window height of the widget */
  height: number;
}

export interface DashboardWidget {
  /** id of the widget type, used to route to the widget (see App.tsx). */
  id: string;
  /** Show/hide widget */
  enabled: boolean;
  /** The layout of the window for the widget on the dashboard. */
  layout: WidgetLayout;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
}

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
