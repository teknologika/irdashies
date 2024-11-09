import { DashboardLayout } from './dashboards';

export const defaultDashboard: DashboardLayout = {
  widgets: [
    {
      id: 'standings',
      layout: {
        x: 50,
        y: 50,
        width: 400,
        height: 600,
      },
    },
    {
      id: 'input',
      layout: {
        x: 50,
        y: 50,
        width: 600,
        height: 120,
      },
    },
  ],
};
