import { useMemo } from 'react';
import { useTelemetry } from '../../../context/TelemetryContext';

export const useDriverIncidents = () => {
  const { session, telemetry } = useTelemetry();
  const incidentLimit = useMemo(() => {
    let limit = session?.WeekendInfo?.WeekendOptions?.IncidentLimit || 0;
    if (limit === 'unlimited') limit = '';
    return limit;
  }, [session?.WeekendInfo?.WeekendOptions?.IncidentLimit]);

  const incidentValue = telemetry?.PlayerCarTeamIncidentCount?.value?.[0] || 0;
  const incidents = useMemo(() => incidentValue, [incidentValue]);

  return {
    incidents,
    incidentLimit,
  };
};
