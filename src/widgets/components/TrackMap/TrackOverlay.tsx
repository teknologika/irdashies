import { useDriverProgress } from './hooks/useDriverProgress';
import { useTrackId } from './hooks/useTrackId';
import { TrackMap } from './TrackMap';

export const TrackOverlay = () => {
  const trackId = useTrackId();
  const driverPct = useDriverProgress();

  if (!trackId) return <></>;

  return (
    <TrackMap trackId={trackId} driver={{ progress: driverPct, carIdx: 1 }} />
  );
};
