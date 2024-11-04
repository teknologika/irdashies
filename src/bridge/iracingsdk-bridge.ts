import { BrowserWindow } from 'electron';
import { IRacingSDK } from 'irsdk-node';

const TIMEOUT = 1000;

export async function publishIRacingSDKEvents(window: BrowserWindow) {
  console.log('Loading iRacing SDK bridge...');

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (await IRacingSDK.IsSimRunning()) {
      console.log('iRacing is running');
      const sdk = new IRacingSDK();
      sdk.autoEnableTelemetry = true;

      await sdk.ready();

      while (sdk.waitForData(TIMEOUT)) {
        console.log('Data received');
        const telemetry = sdk.getTelemetry();
        window.webContents.send('telemetry', telemetry);
      }

      console.log('iRacing is no longer publishing telemetry');
    } else {
      console.log('iRacing is not running');
    }

    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
  }
}
