import { nativeImage, Tray, Menu, app } from 'electron';
import { createSettingsWindow } from './createSettingsWindow';

export const setupTaskbar = () => {
  // TODO: Add icon
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAH5JREFUSEvtlUEOgCAMBJdvGfXz6rs0JuIB0zjZpFyUaxeWadlQlLxK8vnqbrBJGgKqVdJ01ajuQbC/tKwSU91vEDb0fjztK6K9pTp7BoukMbj/WZtrzSXA+exuQNHtoFF0e8jpBhTdJqAbqc7OwYcNaA6orv+XSXOAdemf/gFmjSgZ2hbq7gAAAABJRU5ErkJggg=='
  );
  const tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Settings',
      click() {
        createSettingsWindow();
      },
    },
    {
      label: 'Save Current Telemetry',
      click() {
        if (process.platform === 'darwin') return;
        import('../bridge/iracingSdk/dumpTelemetry').then(
          async ({ dumpCurrentTelemetry }) => await dumpCurrentTelemetry()
        );
      },
    },
    {
      label: 'Quit',
      click() {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('irDashies');
  tray.setContextMenu(contextMenu);
};
