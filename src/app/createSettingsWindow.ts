import { BrowserWindow } from 'electron';
import path from 'node:path';

// used for Hot Module Replacement
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let currentSettingsWindow: BrowserWindow | undefined = undefined;

export const createSettingsWindow = (): BrowserWindow => {
  if (currentSettingsWindow) {
    currentSettingsWindow.show();
    return currentSettingsWindow;
  }

  // Create the browser window.
  const browserWindow = new BrowserWindow({
    title: `iRacing Dashies - Settings`,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  currentSettingsWindow = browserWindow;

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    browserWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}#/settings`);
  } else {
    browserWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      { hash: `/settings` }
    );
  }

  browserWindow.on('closed', () => {
    currentSettingsWindow = undefined;
  });

  return browserWindow;
};
