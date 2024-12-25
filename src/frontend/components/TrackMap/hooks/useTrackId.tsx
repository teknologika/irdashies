import { useMemo } from 'react';
import { useSession } from '@irdashies/context';

export const useTrackId = () => {
  const { session } = useSession();
  const trackId = useMemo(
    () => session?.WeekendInfo.TrackID,
    [session?.WeekendInfo.TrackID]
  );
  return trackId;
};
