export async function iRacingSDKSetup() {
  try {
    const module =
      process.platform === 'darwin'
        ? await import('./mocksdk-bridge')
        : await import('./iracingsdk-bridge');

    const { publishIRacingSDKEvents } = module;
    await publishIRacingSDKEvents();
  } catch (err) {
    console.error(`Failed to load bridge`);
    throw err;
  }
}
