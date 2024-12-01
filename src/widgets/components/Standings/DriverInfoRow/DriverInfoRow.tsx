import { getTailwindColor } from '../../../utils/colors';
import { formatTime } from '../../../utils/time';

type DriverRowInfoProps = {
  carIdx: number;
  classColor: number;
  carNumber: string;
  name: string;
  isPlayer: boolean;
  hasFastestTime: boolean;
  delta?: number;
  position: number;
  badge: React.ReactNode;
  lastTime?: number;
  fastestTime?: number;
  onPitRoad?: boolean;
  onTrack?: boolean;
};

export const DriverInfoRow = ({
  carIdx,
  carNumber,
  classColor,
  name,
  isPlayer,
  hasFastestTime,
  delta,
  position,
  badge,
  lastTime,
  fastestTime,
  onPitRoad,
  onTrack,
}: DriverRowInfoProps) => {
  // convert seconds to mm:ss:ms
  const lastTimeString = formatTime(lastTime);
  const fastestTimeString = formatTime(fastestTime);

  return (
    <tr
      key={carIdx}
      className={[
        `odd:bg-slate-800/70 even:bg-slate-900/70 text-sm text-white`,
        !onTrack ? 'text-opacity-60' : '',
        isPlayer ? 'text-amber-500' : '',
      ].join(' ')}
    >
      <td
        className={`text-center px-2 ${isPlayer ? `${getTailwindColor(classColor).classHeader} text-white` : ''}`}
      >
        {position}
      </td>
      <td
        className={`${getTailwindColor(classColor).driverIcon} bg-opacity-90 border-l-4 text-right px-1 w-10`}
      >
        #{carNumber}
      </td>
      <td className={`px-2 w-full`}>
        <div className="flex justify-between align-center">
          <span>{name}</span>
          {onPitRoad && (
            <span className="text-xs border-yellow-500 border-2 rounded-md px-2">
              PIT
            </span>
          )}
        </div>
      </td>
      <td>{badge}</td>
      <td className={`px-2`}>{delta?.toFixed(1)}</td>
      <td className={`px-2 ${hasFastestTime ? 'text-purple-400' : ''}`}>
        {fastestTimeString}
      </td>
      <td
        className={`px-2 ${
          lastTimeString === fastestTimeString
            ? hasFastestTime
              ? 'text-purple-400'
              : 'text-green-400'
            : ''
        }`}
      >
        {lastTimeString}
      </td>
    </tr>
  );
};
