import { useMemo } from 'react';
import { useSession } from '../../../context/TelemetryContext';

export const useTrackId = () => {
  const { session } = useSession();
  const trackId = useMemo(
    () => session?.WeekendInfo.TrackID,
    [session?.WeekendInfo.TrackID]
  );
  return trackId;
};
