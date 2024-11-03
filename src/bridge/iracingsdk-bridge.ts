import { BrowserWindow } from 'electron';
import { IRacingSDK } from 'irsdk-node';

const TIMEOUT = 1000 / 60; // 60 FPS

export async function publishIRacingSDKEvents(window: BrowserWindow) {
  console.log('Loading iRacing SDK bridge...');
  const isSimRunning = await IRacingSDK.IsSimRunning();
  if (!isSimRunning) {
    console.log('iRacing is not running');
    return;
  }

  const sdk = new IRacingSDK();
  if (sdk.waitForData(TIMEOUT)) {
    console.log('iRacing SDK is running');
  }

  setInterval(() => {
    // TODO: Replace this with actual telemetry data from irsdk-node
    window.webContents.send('telemetry', `is sim running: ${isSimRunning}`);
  }, 1000);
}
