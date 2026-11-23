import { useEffect } from 'react';
import { useChannelSnapshot } from '../ChannelStore/useChannelSnapshot';
import { useReplayRebuildStore } from './ReplayRebuildStore';

/** Copies the `replay.rebuild` channel into the store. Mount once per window. */
export const useReplayRebuildUpdater = () => {
  const snapshot = useChannelSnapshot('replay.rebuild');

  useEffect(() => {
    if (snapshot) useReplayRebuildStore.getState().setSnapshot(snapshot);
  }, [snapshot]);
};
