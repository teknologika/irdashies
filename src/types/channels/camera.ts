export interface CameraStateSnapshot {
  camCarIdx: number;
  camGroupNumber: number;
  camCameraNumber: number;
  camCameraState: number;
  version: number;
}

/** irsdk_UIHidden — hides the iRacing HUD and replay controls. */
export const CAM_STATE_UI_HIDDEN = 0x0008;
