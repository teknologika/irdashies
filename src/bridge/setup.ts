export async function iRacingSDKSetup() {
  try {
    const module =
      process.platform === 'darwin'
        ? await import('./mock-data/mockSdkBridge')
        : await import('./iracingSdkBridge');

    const { publishIRacingSDKEvents } = module;
    await publishIRacingSDKEvents();
  } catch (err) {
    console.error(`Failed to load bridge`);
    throw err;
  }
}
