import { useMemo } from 'react';
import { useTelemetry } from '../TelemetryContext';

export const useDriverIncidents = () => {
  const { session, telemetry } = useTelemetry();
  const incidentLimit = useMemo(() => {
    let limit = session?.WeekendInfo?.WeekendOptions?.IncidentLimit || 0;
    if (limit === 'unlimited') limit = '';
    return limit;
  }, [session?.WeekendInfo?.WeekendOptions?.IncidentLimit]);

  const incidents = useMemo(
    () => telemetry?.PlayerCarTeamIncidentCount?.value?.[0] || 0,
    [telemetry?.PlayerCarTeamIncidentCount?.value]
  );

  return {
    incidents,
    incidentLimit,
  };
};
