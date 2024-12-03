import { useMemo } from 'react';
import { useTelemetry } from '../../../context/TelemetryContext';

const wetnessLevels: Record<number, string> = {
  0: '',
  1: 'Dry',
  2: 'Mostly Dry',
  3: 'Very Lightly Wet',
  4: 'Lightly Wet',
  5: 'Moderately Wet',
  6: 'Very Wet',
  7: 'Extremely Wet',
};

export const useTrackWetness = () => {
  const { telemetry } = useTelemetry();

  const trackWetness = useMemo(() => {
    const wetnessLevel = telemetry?.TrackWetness?.value[0] ?? 0;

    return wetnessLevels[wetnessLevel] ?? '';
  }, [telemetry?.TrackWetness?.value?.[0]]);

  return { trackWetness };
};
