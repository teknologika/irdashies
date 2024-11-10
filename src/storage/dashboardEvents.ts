import { EventEmitter } from 'node:events';
import { DashboardLayout } from './dashboards';

const dashboardEvents = new EventEmitter();

export const onDashboardUpdated = (
  listener: (dashboard: DashboardLayout) => void
) => {
  dashboardEvents.on('dashboardUpdated', listener);
};

export const emitDashboardUpdated = (dashboard: DashboardLayout) => {
  dashboardEvents.emit('dashboardUpdated', dashboard);
};
