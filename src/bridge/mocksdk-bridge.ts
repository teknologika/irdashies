import { BrowserWindow } from "electron";

export async function mockIRacingSDKEvents(window: BrowserWindow) {
  setInterval(() => {
    window.webContents.send('telemetry', {
      Throttle: Math.random(),
      Brake: Math.random(),
      Clutch: Math.random(),
      Gear: Math.floor(Math.random() * 7),
      Speed: Math.floor(Math.random() * 200),
    });
  }, 1000);
}
