/**
 * Replay playback speeds for the two-pass rebuild.
 *
 * These values are derived from the calibration spec (rebuildSpeeds.spec.ts),
 * which downsamples recorded 60 Hz telemetry and asserts parity with the
 * full-rate result. Lower a value here when the spec reports missed events.
 *
 * iRacing delivers ~60 telemetry frames per wall-clock second regardless of
 * replay speed, so at Nx the processor sees 60/N samples per race-second.
 *
 * | Signal                        | Min samples/s needed | Max Nx |
 * |-------------------------------|----------------------|--------|
 * | CarIdxLap (counter)           | 1                    | any    |
 * | CarIdxOnPitRoad (held state)  | ~2                   | 16x    |
 * | Off-track (brief excursions)  | ~15                  | 4x     |
 * | Position-derived decel        | ~30                  | 2x     |
 */
export const REBUILD_SPEEDS = {
  /**
   * Pass 1 sweep: lap history and pit stops only; impact detection is off.
   * 16x is iRacing's maximum ReplaySetPlaySpeed.
   */
  sweep: 16,
  /**
   * Pass 2 confirmation: full incident detection including position-derived
   * deceleration (crash/impact). Must be low enough that the deceleration
   * baseline (SPEED_BASELINE_S = 0.5s) collects ≥15 samples.
   */
  impact: 2,
} as const;
