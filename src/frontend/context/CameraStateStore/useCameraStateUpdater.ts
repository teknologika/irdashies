import { useEffect } from 'react';
import { useChannelSnapshot } from '../ChannelStore/useChannelSnapshot';
import { useCameraStateStore } from './CameraStateStore';

/** Copies the `camera.state` channel into the store. Mount once per window. */
export const useCameraStateUpdater = () => {
  const snapshot = useChannelSnapshot('camera.state');

  useEffect(() => {
    if (snapshot) useCameraStateStore.getState().setSnapshot(snapshot);
  }, [snapshot]);
};
