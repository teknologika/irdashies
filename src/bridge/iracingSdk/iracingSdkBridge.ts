import { IRacingSDK } from 'irsdk-node';
import { TelemetrySink } from './telemetrySink';
import { OverlayManager } from 'src/app/overlayManager';

const TIMEOUT = 1000;

export async function publishIRacingSDKEvents(
  telemetrySink: TelemetrySink,
  overlayManager: OverlayManager
) {
  console.log('Loading iRacing SDK bridge...');

  setInterval(async () => {
    const isSimRunning = await IRacingSDK.IsSimRunning();
    console.log('Sending running state to window', isSimRunning);
    overlayManager.publishMessage('runningState', isSimRunning);
  }, 2000);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (await IRacingSDK.IsSimRunning()) {
      console.log('iRacing is running');
      const sdk = new IRacingSDK();
      sdk.autoEnableTelemetry = true;

      await sdk.ready();

      while (sdk.waitForData(TIMEOUT)) {
        const telemetry = sdk.getTelemetry();
        const session = sdk.getSessionData();
        await new Promise((resolve) => setTimeout(resolve, 1000 / 60));

        if (telemetry) {
          overlayManager.publishMessage('telemetry', telemetry);
          telemetrySink.addTelemetry(telemetry);
        }

        if (session) {
          overlayManager.publishMessage('sessionData', session);
          telemetrySink.addSession(session);
        }
      }

      console.log('iRacing is no longer publishing telemetry');
    } else {
      console.log('iRacing is not running');
    }

    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
  }
}
