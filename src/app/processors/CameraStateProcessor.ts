import type {
  CameraStateSnapshot,
  Session,
  SessionLifecycleEvent,
  Telemetry,
} from '@irdashies/types';
import type { TelemetryProcessor } from './TelemetryProcessor';

const numVal = (frame: Telemetry, key: string, fallback = 0): number => {
  const entry = (
    frame as unknown as Record<string, { value?: unknown[] } | undefined>
  )[key];
  const v = entry?.value?.[0];
  return typeof v === 'number' ? v : fallback;
};

export class CameraStateProcessor implements TelemetryProcessor<CameraStateSnapshot> {
  readonly channel = 'camera.state' as const;
  readonly tickRateHz = 5 as const;

  private camCarIdx = 0;
  private camGroupNumber = 0;
  private camCameraNumber = 0;
  private camCameraState = 0;
  private version = 0;

  init(session: Session): void {
    void session;
  }

  onFrame(frame: Telemetry): boolean {
    const carIdx = numVal(frame, 'CamCarIdx');
    const groupNum = numVal(frame, 'CamGroupNumber');
    const cameraNum = numVal(frame, 'CamCameraNumber');
    const cameraState = numVal(frame, 'CamCameraState');

    if (
      carIdx === this.camCarIdx &&
      groupNum === this.camGroupNumber &&
      cameraNum === this.camCameraNumber &&
      cameraState === this.camCameraState
    ) {
      return false;
    }

    this.camCarIdx = carIdx;
    this.camGroupNumber = groupNum;
    this.camCameraNumber = cameraNum;
    this.camCameraState = cameraState;
    this.version++;
    return true;
  }

  onLifecycle(event: SessionLifecycleEvent): void {
    if (event.type === 'disconnect') {
      this.camCarIdx = 0;
      this.camGroupNumber = 0;
      this.camCameraNumber = 0;
      this.camCameraState = 0;
      this.version++;
    }
  }

  snapshot(): CameraStateSnapshot {
    return {
      camCarIdx: this.camCarIdx,
      camGroupNumber: this.camGroupNumber,
      camCameraNumber: this.camCameraNumber,
      camCameraState: this.camCameraState,
      version: this.version,
    };
  }
}
