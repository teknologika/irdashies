export type CameraFocusMode =
  | { type: 'driver'; carNumber: string }
  | { type: 'crashes' }
  | { type: 'leader' }
  | { type: 'exiting' };

export interface BroadcastCameraBridge {
  switchCamera: (focus: CameraFocusMode, groupNumber: number) => Promise<void>;
  setStateFlags: (flags: number) => Promise<void>;
}
