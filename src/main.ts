import { app } from 'electron';
import { iRacingSDKSetup } from './bridge/setup';
import { getOrCreateDefaultDashboard } from './storage/dashboards';
import { createWidgets, setupTaskbar, trackWindowMovement } from './app';

// @ts-expect-error no types for squirrel
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) app.quit();

app.on('ready', () => {
  const dashboard = getOrCreateDefaultDashboard();
  createWidgets(dashboard.widgets).forEach(({ widget, window }) =>
    trackWindowMovement(widget, window)
  );

  setupTaskbar();
  iRacingSDKSetup();
});

app.on('window-all-closed', () => app.quit());
