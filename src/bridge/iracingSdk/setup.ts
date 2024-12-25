import { OverlayManager } from 'src/app/overlayManager';
import { TelemetrySink } from './telemetrySink';

export async function iRacingSDKSetup(
  telemetrySink: TelemetrySink,
  overlayManager: OverlayManager
) {
  try {
    const module =
      process.platform === 'darwin'
        ? await import('./mock-data/mockSdkBridge')
        : await import('./iracingSdkBridge');

    const { publishIRacingSDKEvents } = module;
    await publishIRacingSDKEvents(telemetrySink, overlayManager);
  } catch (err) {
    console.error(`Failed to load bridge`);
    throw err;
  }
}
