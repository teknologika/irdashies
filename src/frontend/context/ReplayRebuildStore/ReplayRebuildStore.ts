import { create } from 'zustand';
import type { ReplayRebuildSnapshot } from '@irdashies/types';

const INITIAL_REBUILD: ReplayRebuildSnapshot = {
  status: { kind: 'idle' },
  version: 0,
};

interface ReplayRebuildState {
  snapshot: ReplayRebuildSnapshot;
  setSnapshot: (snapshot: ReplayRebuildSnapshot) => void;
}

export const useReplayRebuildStore = create<ReplayRebuildState>((set) => ({
  snapshot: INITIAL_REBUILD,
  setSnapshot: (snapshot) => set({ snapshot }),
}));

export const useReplayRebuildSnapshot = (): ReplayRebuildSnapshot =>
  useReplayRebuildStore((state) => state.snapshot);
