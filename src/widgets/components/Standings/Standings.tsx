import {
  useTelemetry,
  useCurrentSession,
} from '../../context/TelemetryContext';
import { DriverRatingBadge } from './DriverRatingBadge/DriverRatingBadge';
import { DriverInfoRow } from './DriverInfoRow/DriverInfoRow';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import React from 'react';
import { DriverClassHeader } from './DriverClassHeader/DriverClassHeader';
import { SessionBar } from './SessionBar/SessionBar';
import { createStandings } from './createStandings';

export const Standings = () => {
  const [parent] = useAutoAnimate();
  const { session, telemetry } = useTelemetry();
  const currentSession = useCurrentSession();

  if (!session || !telemetry || !currentSession) return <></>;

  const classes = createStandings(session, telemetry, currentSession);

  return (
    <div className="w-full h-full">
      <SessionBar />
      <table className="w-full table-auto text-xs border-separate border-spacing-y-0.5">
        <tbody ref={parent}>
          {classes.map(([classId, standings]) => (
            <React.Fragment key={classId}>
              <DriverClassHeader
                className={standings[0].carClass.name}
                classColor={standings[0].carClass.color}
              />
              {standings.map((result) => (
                <DriverInfoRow
                  key={result.carIdx}
                  carIdx={result.carIdx}
                  classColor={result.carClass.color}
                  carNumber={result.driver?.carNum || ''}
                  name={result.driver?.name || ''}
                  isPlayer={result.isPlayer}
                  hasFastestTime={result.hasFastestTime}
                  delta={result.delta}
                  position={result.position}
                  lastTime={result.lastTime}
                  fastestTime={result.fastestTime}
                  badge={
                    <DriverRatingBadge
                      license={result.driver?.license}
                      rating={result.driver?.rating}
                    />
                  }
                />
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
