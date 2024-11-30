import { DriverRatingBadge } from './DriverRatingBadge/DriverRatingBadge';
import { DriverInfoRow } from './DriverInfoRow/DriverInfoRow';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { DriverClassHeader } from './DriverClassHeader/DriverClassHeader';
import { SessionBar } from './SessionBar/SessionBar';
import { Fragment } from 'react/jsx-runtime';
import { useDriverStandings } from './hooks/useDriverStandings';

export const Standings = () => {
  const [parent] = useAutoAnimate();
  const standings = useDriverStandings({ buffer: 3 });

  return (
    <div className="w-full h-full">
      <SessionBar />
      <table className="w-full table-auto text-xs border-separate border-spacing-y-0.5">
        <tbody ref={parent}>
          {standings.map(([classId, classStandings]) => (
            <Fragment key={classId}>
              <DriverClassHeader
                className={classStandings[0].carClass.name}
                classColor={classStandings[0].carClass.color}
              />
              {classStandings.map((result) => (
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
                  onPitRoad={result.onPitRoad}
                  onTrack={result.onTrack}
                  badge={
                    <DriverRatingBadge
                      license={result.driver?.license}
                      rating={result.driver?.rating}
                    />
                  }
                />
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
