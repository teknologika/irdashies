import { create } from 'zustand';
import type { CameraStateSnapshot } from '@irdashies/types';

export const INITIAL_CAMERA_STATE: CameraStateSnapshot = {
  camCarIdx: 0,
  camGroupNumber: 0,
  camCameraNumber: 0,
  camCameraState: 0,
  version: 0,
};

interface CameraStateStoreState {
  snapshot: CameraStateSnapshot;
  setSnapshot: (snapshot: CameraStateSnapshot) => void;
  reset: () => void;
}

export const useCameraStateStore = create<CameraStateStoreState>((set) => ({
  snapshot: INITIAL_CAMERA_STATE,
  setSnapshot: (snapshot) => set({ snapshot }),
  reset: () => set({ snapshot: INITIAL_CAMERA_STATE }),
}));

export const useCameraStateSnapshot = (): CameraStateSnapshot =>
  useCameraStateStore((state) => state.snapshot);
