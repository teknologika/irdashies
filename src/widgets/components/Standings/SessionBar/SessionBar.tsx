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
    <div className="bg-slate-900/70 text-sm px-3 py-1 flex justify-between">
      <div>{session?.SessionName}</div>
      {total > 0 && (
        <div>
          {current} / {total} laps
        </div>
      )}
      {timeRemaining <= 86400 && ( // 86400 seconds = 24 hours
        <div>
          {timeElapsed
            ? `${formatTimeShort(timeElapsed)} / ${formatTimeShort(timeRemaining, true)} m`
            : ''}
        </div>
      )}
      <div>
        {incidents}
        {incidentLimit ? ' / ' + incidentLimit : ''} x
      </div>
    </div>
  );
};
