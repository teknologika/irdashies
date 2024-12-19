import { BrowserWindow } from 'electron';
import { DashboardWidget } from '../storage/dashboards';
import path from 'node:path';

// used for Hot Module Replacement
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

export const createWidgets = (
  widgets: DashboardWidget[]
): { widget: DashboardWidget; window: BrowserWindow }[] => {
  return widgets
    .filter((w) => w.enabled)
    .map((widget) => ({ widget, window: createWidget(widget) }));
};

export const createWidget = ({
  id,
  layout,
}: DashboardWidget): BrowserWindow => {
  const { x, y, width, height } = layout;
  const title = id.charAt(0).toUpperCase() + id.slice(1);

  // Create the browser window.
  const browserWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    title: `iRacing Dashies - ${title}`,
    transparent: true,
    frame: false,
    focusable: false,
    resizable: false,
    movable: false,
    roundedCorners: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  browserWindow.setAlwaysOnTop(true, 'floating', 1);
  browserWindow.setIgnoreMouseEvents(true);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    browserWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}#/${id}`);
  } else {
    browserWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      { hash: `/${id}` }
    );
  }

  return browserWindow;
};
