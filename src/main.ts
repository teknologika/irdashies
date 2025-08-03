import { app } from 'electron';
import { iRacingSDKSetup } from './app/bridge/iracingSdk/setup';
import { getOrCreateDefaultDashboard } from './app/storage/dashboards';
import { setupTaskbar } from './app';
import { publishDashboardUpdates } from './app/bridge/dashboard/dashboardBridge';
import { TelemetrySink } from './app/bridge/iracingSdk/telemetrySink';
import { OverlayManager } from './app/overlayManager';
import { HttpWidgetServer } from './app';
import { updateElectronApp } from 'update-electron-app';
// @ts-expect-error no types for squirrel
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) app.quit();

updateElectronApp();

const overlayManager = new OverlayManager();
const telemetrySink = new TelemetrySink();
const httpWidgetServer = new HttpWidgetServer();

/**
 * Attempt to start the HTTP widget server with graceful error handling
 * @param retryCount Number of retry attempts (default: 1)
 * @returns Promise<boolean> indicating if server started successfully
 */
async function startHttpWidgetServerGracefully(retryCount: number = 1): Promise<boolean> {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      const port = await httpWidgetServer.start();
      console.log(`HTTP widget server started successfully on port ${port} (attempt ${attempt}/${retryCount})`);
      console.log(`Widget URLs will be available at http://127.0.0.1:${port}/widget?type=<widget_type>`);
      console.log('Available widget types: standings, trackmap, weather, input, relative, fastercars');
      return true;
    } catch (error) {
      console.error(`HTTP widget server startup attempt ${attempt}/${retryCount} failed:`, error);
      
      // Provide detailed error information based on error type
      if (error instanceof Error) {
        if (error.message.includes('EADDRINUSE')) {
          console.error('Error: All ports in range 58080-58089 are occupied');
        } else if (error.message.includes('EACCES')) {
          console.error('Error: Permission denied - try running with appropriate permissions');
        } else if (error.message.includes('No available port found')) {
          console.error('Error: No available ports found in range 58080-58089');
        } else {
          console.error('Error: Unexpected server startup failure -', error.message);
        }
      }
      
      // If this isn't the last attempt, wait before retrying
      if (attempt < retryCount) {
        console.log(`Retrying in 2 seconds... (attempt ${attempt + 1}/${retryCount})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  // All attempts failed
  console.error('HTTP widget server startup failed after all retry attempts');
  console.error('OBS widget integration will not be available this session');
  console.log('The main irdashies application will continue to work normally');
  console.log('OBS widget integration can be retried by restarting the application');
  
  return false;
}

app.on('ready', async () => {
  const dashboard = getOrCreateDefaultDashboard();
  overlayManager.createOverlays(dashboard);

  setupTaskbar(telemetrySink, overlayManager);
  iRacingSDKSetup(telemetrySink, overlayManager);
  publishDashboardUpdates(overlayManager);

  // Start HTTP widget server for OBS integration with graceful error handling
  console.log('Starting HTTP widget server for OBS integration...');
  await startHttpWidgetServerGracefully(2); // Try up to 2 times with delay
});

app.on('window-all-closed', () => app.quit());

app.on('before-quit', async (event) => {
  // Prevent the app from quitting immediately to allow graceful shutdown
  event.preventDefault();
  
  console.log('App shutting down, stopping HTTP widget server...');
  
  try {
    if (httpWidgetServer.isRunning()) {
      await httpWidgetServer.stop();
      console.log('HTTP widget server stopped successfully');
    }
  } catch (error) {
    console.error('Error stopping HTTP widget server:', error);
  } finally {
    // Now allow the app to quit
    app.quit();
  }
});

app.on('quit', () => console.warn('App quit'));
