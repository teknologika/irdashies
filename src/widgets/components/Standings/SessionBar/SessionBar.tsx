import {
  useDriverIncidents,
  useCurrentSession,
} from '../../../context/TelemetryContext';

export const SessionBar = () => {
  const session = useCurrentSession();
  const { incidentLimit, incidents } = useDriverIncidents();
  return (
    <div className="bg-slate-900/70 text-xs px-3 py-1 flex justify-between">
      {session?.SessionName && <div>{session?.SessionName}</div>}
      <div>
        {incidents}
        {incidentLimit ? ' / ' + incidentLimit : ''} x
      </div>
    </div>
  );
};
