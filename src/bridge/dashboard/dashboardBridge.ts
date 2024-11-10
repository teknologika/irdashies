import { BrowserWindow, ipcMain } from 'electron';
import { onDashboardUpdated } from '../../storage/dashboardEvents';
import { getDashboard, saveDashboard } from '../../storage/dashboards';

export async function publishDashboardUpdates() {
  onDashboardUpdated((dashboard) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('dashboardUpdated', dashboard);
    });
  });
  ipcMain.on('saveDashboard', (_, dashboard) => {
    saveDashboard('default', dashboard);
  });
  ipcMain.on('reloadDashboard', () => {
    const dashboard = getDashboard('default');
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('dashboardUpdated', dashboard);
    });
  });
}
