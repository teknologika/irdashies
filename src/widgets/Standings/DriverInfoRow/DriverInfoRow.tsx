import { formatTime } from '../../utils/time';

type DriverRowInfoProps = {
  carIdx: number;
  classIdx: number;
  carNumber: string;
  name: string;
  isPlayer: boolean;
  hasFastestTime: boolean;
  delta: number;
  position: number;
  badge: React.ReactNode;
  lastTime?: number;
  fastestTime?: number;
};

export const DriverInfoRow = ({
  carIdx,
  carNumber,
  classIdx,
  name,
  isPlayer,
  hasFastestTime,
  delta,
  position,
  badge,
  lastTime,
  fastestTime,
}: DriverRowInfoProps) => {
  // convert seconds to mm:ss:ms
  const lastTimeString = formatTime(lastTime);
  const fastestTimeString = formatTime(fastestTime);

  return (
    <tr
      key={carIdx}
      className={`odd:bg-slate-800/70 even:bg-slate-900/70 text-xs text-white
         ${isPlayer ? 'text-yellow-500' : ''}`}
    >
      <td
        className={`text-center px-2 ${isPlayer ? 'bg-yellow-500 text-black' : ''}`}
      >
        {position}
      </td>
      <td
        className={`${classColorMap[classIdx % classColorMap.length]} bg-opacity-90 border-l-4 text-right px-1 w-10`}
      >
        #{carNumber}
      </td>
      <td className={`px-2 w-full`}>{name}</td>
      <td>{badge}</td>
      <td className="px-2">{delta?.toFixed(1)}</td>
      <td className={`px-2 ${hasFastestTime ? 'text-purple-400' : ''}`}>
        {fastestTimeString}
      </td>
      <td className="px-2">{lastTimeString}</td>
    </tr>
  );
};

export const classColorMap = [
  'bg-yellow-700 border-yellow-500',
  'bg-blue-800 border-blue-500',
  'bg-pink-800 border-pink-500',
  'bg-purple-800 border-purple-500',
];
