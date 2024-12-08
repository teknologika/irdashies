import { useMemo } from 'react';
import { useTelemetry } from '../../../context/TelemetryContext';

export const useTrackTemperature = () => {
  const { telemetry } = useTelemetry();

  const trackTemp = useMemo(() => {
    const trackTemp = telemetry?.TrackTempCrew?.value[0] ?? 0;

    if (!trackTemp) return '';
    return `${trackTemp.toFixed(0)}°${telemetry?.TrackTempCrew?.unit}`;
  }, [telemetry?.TrackTempCrew?.value?.[0]]);

  const airTemp = useMemo(() => {
    const trackTemp = telemetry?.AirTemp?.value[0] ?? 0;

    if (!trackTemp) return '';
    return `${trackTemp.toFixed(0)}°${telemetry?.AirTemp?.unit}`;
  }, [telemetry?.AirTemp?.value?.[0]]);

  return { trackTemp, airTemp };
};
