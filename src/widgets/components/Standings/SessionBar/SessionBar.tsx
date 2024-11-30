import { formatTimeShort } from '../../../utils/time';
import {
  useCurrentSession,
  useDriverIncidents,
  useSessionLapCount,
} from '../hooks';

export const SessionBar = () => {
  const session = useCurrentSession();
  const { incidentLimit, incidents } = useDriverIncidents();
  const { total, current, timeElapsed, timeRemaining } = useSessionLapCount();
  return (
    <div className="bg-slate-900/70 text-xs px-3 py-1 flex justify-between">
      {session?.SessionName && <div>{session?.SessionName}</div>}
      {total > 0 ? (
        <div>
          {current} / {total} laps
        </div>
      ) : (
        <div>
          {formatTimeShort(timeElapsed)} / {formatTimeShort(timeRemaining)} m
        </div>
      )}
      <div>
        {incidents}
        {incidentLimit ? ' / ' + incidentLimit : ''} x
      </div>
    </div>
  );
};
