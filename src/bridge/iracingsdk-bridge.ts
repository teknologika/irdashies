import { BrowserWindow } from "electron";
import { IRacingSDK } from 'irsdk-node';

export async function publishIRacingSDKEvents(window: BrowserWindow) {
  console.log('Loading iRacing SDK bridge...');
  const isSimRunning = await IRacingSDK.IsSimRunning();

  setInterval(() => {
    // TODO: Replace this with actual telemetry data from irsdk-node
    window.webContents.send('telemetry', `is sim running: ${isSimRunning}`);
  }, 1000);
}
