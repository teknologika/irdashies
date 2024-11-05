import { app, BrowserWindow } from 'electron';
import path from 'path';
import { mockIRacingSDKEvents } from './bridge/mocksdk-bridge';

// @ts-expect-error no types for squirrel
import started from 'electron-squirrel-startup';

// used for Hot Module Replacement
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 600,
    title: 'iRacing Dashies',
    height: 120,
    transparent: true,
    frame: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      transparent: true,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'floating', 1);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // loads data from iRacing SDK and publishes it to the renderer
  if (process.platform === 'darwin') {
    mockIRacingSDKEvents(mainWindow);
  } else {
    // Load the iRacing SDK bridge (only Windows)
    import('./bridge/iracingsdk-bridge')
      .then(async ({ publishIRacingSDKEvents }) => {
        await publishIRacingSDKEvents(mainWindow);
      })
      .catch((err) => {
        console.error('Failed to load iracingsdk-bridge:', err);
      });
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
