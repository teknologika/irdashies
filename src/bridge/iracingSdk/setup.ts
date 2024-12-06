import { TelemetrySink } from './telemetrySink';

export async function iRacingSDKSetup(telemetrySink: TelemetrySink) {
  try {
    const module =
      process.platform === 'darwin'
        ? await import('./mock-data/mockSdkBridge')
        : await import('./iracingSdkBridge');

    const { publishIRacingSDKEvents } = module;
    await publishIRacingSDKEvents(telemetrySink);
  } catch (err) {
    console.error(`Failed to load bridge`);
    throw err;
  }
}
