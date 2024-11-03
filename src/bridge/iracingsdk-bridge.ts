import { BrowserWindow } from "electron";

export function publishIRacingSDKEvents(window: BrowserWindow) {
  setInterval(() => {
    // TODO: Replace this with actual telemetry data from irsdk-node
    window.webContents.send('telemetry', 'whoooooooh!');
  }, 1000);
}
