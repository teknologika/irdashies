import { describe, it, expect } from 'vitest';
import { CameraStateProcessor } from './CameraStateProcessor';
import type { Telemetry } from '@irdashies/types';

const frame = (
  carIdx: number,
  groupNum: number,
  cameraNum: number,
  cameraState: number
): Telemetry =>
  ({
    CamCarIdx: { value: [carIdx] },
    CamGroupNumber: { value: [groupNum] },
    CamCameraNumber: { value: [cameraNum] },
    CamCameraState: { value: [cameraState] },
  }) as unknown as Telemetry;

describe('CameraStateProcessor', () => {
  it('emits initial snapshot with zero values', () => {
    const p = new CameraStateProcessor();
    const snap = p.snapshot();
    expect(snap.camCarIdx).toBe(0);
    expect(snap.camGroupNumber).toBe(0);
    expect(snap.camCameraNumber).toBe(0);
    expect(snap.camCameraState).toBe(0);
  });

  it('updates snapshot when camera values change', () => {
    const p = new CameraStateProcessor();
    p.onFrame(frame(3, 14, 2, 0x0008));
    const snap = p.snapshot();
    expect(snap.camCarIdx).toBe(3);
    expect(snap.camGroupNumber).toBe(14);
    expect(snap.camCameraNumber).toBe(2);
    expect(snap.camCameraState).toBe(0x0008);
  });

  it('increments version on change', () => {
    const p = new CameraStateProcessor();
    const v0 = p.snapshot().version;
    p.onFrame(frame(1, 1, 1, 0));
    expect(p.snapshot().version).toBe(v0 + 1);
  });

  it('does not increment version when nothing changed', () => {
    const p = new CameraStateProcessor();
    p.onFrame(frame(1, 5, 2, 0));
    const v1 = p.snapshot().version;
    p.onFrame(frame(1, 5, 2, 0));
    expect(p.snapshot().version).toBe(v1);
  });

  it('resets to zero on disconnect lifecycle event', () => {
    const p = new CameraStateProcessor();
    p.onFrame(frame(3, 14, 2, 0x0008));
    p.onLifecycle({ type: 'disconnect' });
    const snap = p.snapshot();
    expect(snap.camCarIdx).toBe(0);
    expect(snap.camGroupNumber).toBe(0);
    expect(snap.camCameraState).toBe(0);
  });

  it('does not reset on sessionNumChange lifecycle event', () => {
    const p = new CameraStateProcessor();
    p.onFrame(frame(3, 14, 2, 0x0008));
    p.onLifecycle({ type: 'sessionNumChange' });
    expect(p.snapshot().camCarIdx).toBe(3);
  });
});
