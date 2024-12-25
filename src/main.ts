import { app } from 'electron';
import { iRacingSDKSetup } from './bridge/iracingSdk/setup';
import { getOrCreateDefaultDashboard } from './app/storage/dashboards';
import { setupTaskbar, trackWindowMovement } from './app';
import { publishDashboardUpdates } from './bridge/dashboard/dashboardBridge';

// @ts-expect-error no types for squirrel
import started from 'electron-squirrel-startup';
import { TelemetrySink } from './bridge/iracingSdk/telemetrySink';
import { OverlayManager } from './app/overlayManager';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) app.quit();

const overlayManager = new OverlayManager();
const telemetrySink = new TelemetrySink();

app.on('ready', () => {
  const dashboard = getOrCreateDefaultDashboard();
  overlayManager.createOverlays(dashboard);

  setupTaskbar(telemetrySink, overlayManager);
  iRacingSDKSetup(telemetrySink, overlayManager);
  publishDashboardUpdates(overlayManager);
});

app.on('window-all-closed', () => app.quit());
app.on('quit', () => console.warn('App quit'));
