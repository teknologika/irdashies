import {
  nativeImage,
  Tray,
  Menu,
  app,
  BrowserWindow,
  globalShortcut,
} from 'electron';
import { createSettingsWindow } from './createSettingsWindow';
import { TelemetrySink } from '../bridge/iracingSdk/telemetrySink';

class Taskbar {
  private tray: Tray;
  private isLocked: boolean;

  constructor(private telemetrySink: TelemetrySink) {
    this.isLocked = true;
    this.tray = this.createTray();
    this.setupContextMenu();
    this.registerShortcuts();
  }

  private createTray(): Tray {
    const icon = nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAH5JREFUSEvtlUEOgCAMBJdvGfXz6rs0JuIB0zjZpFyUaxeWadlQlLxK8vnqbrBJGgKqVdJ01ajuQbC/tKwSU91vEDb0fjztK6K9pTp7BoukMbj/WZtrzSXA+exuQNHtoFF0e8jpBhTdJqAbqc7OwYcNaA6orv+XSXOAdemf/gFmjSgZ2hbq7gAAAABJRU5ErkJggg=='
    );
    const tray = new Tray(icon);
    tray.setToolTip('irDashies');
    return tray;
  }

  private setupContextMenu(): void {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Settings',
        click: () => {
          createSettingsWindow();
        },
      },
      {
        label: 'Lock / Unlock (F6)',
        click: () => {
          this.toggleLockWindows();
        },
      },
      {
        label: 'Save Current Telemetry (F7)',
        click: () => {
          this.saveTelemetry();
        },
      },
      {
        label: 'Record Telemetry',
        click: async () => {
          await this.telemetrySink.startRecording();
        },
      },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  private toggleLockWindows(): void {
    this.isLocked = !this.isLocked;
    BrowserWindow.getAllWindows().forEach((window) => {
      if (window.isAlwaysOnTop()) {
        window.setResizable(!this.isLocked);
        window.setMovable(!this.isLocked);
        window.setIgnoreMouseEvents(this.isLocked);
        window.blur();
        window.webContents.send('editModeToggled', !this.isLocked);
      }
    });
  }

  private saveTelemetry(): void {
    if (process.platform === 'darwin') return;
    import('../bridge/iracingSdk/dumpTelemetry').then(
      async ({ dumpCurrentTelemetry }) => await dumpCurrentTelemetry()
    );
  }

  private registerShortcuts(): void {
    globalShortcut.register('F6', () => {
      this.toggleLockWindows();
    });
    globalShortcut.register('F7', () => {
      this.saveTelemetry();
    });
  }
}

export const setupTaskbar = (telemetrySink: TelemetrySink) => {
  new Taskbar(telemetrySink);
};
