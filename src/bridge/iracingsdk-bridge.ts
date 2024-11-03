import { BrowserWindow } from 'electron';

export async function publishIRacingSDKEvents(window: BrowserWindow) {
  console.log('Loading iRacing SDK bridge...');

  setInterval(() => {
    // TODO: Replace this with actual telemetry data from irsdk-node
    window.webContents.send('telemetry', `hello world`);
  }, 1000);
}
