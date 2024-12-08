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
      <div className="flex flex-1 flex-grow">{session?.SessionName}</div>
      {current > 0 && (
        <div className="flex flex-1 flex-grow justify-center">
          L {current} {total ? ` / ${total}` : ''}
        </div>
      )}
      {timeRemaining <= 86400 && ( // 86400 seconds = 24 hours
        <div className="flex flex-1 flex-grow justify-center">
          {timeElapsed
            ? `${formatTimeShort(timeElapsed)} / ${formatTimeShort(timeRemaining, true)} m`
            : ''}
        </div>
      )}
      <div className="flex flex-1 flex-grow justify-end">
        {incidents}
        {incidentLimit ? ' / ' + incidentLimit : ''} x
      </div>
    </div>
  );
};
