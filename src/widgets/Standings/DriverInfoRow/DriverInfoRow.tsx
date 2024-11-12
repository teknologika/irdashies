type DriverRowInfoProps = {
  carNumber: number;
  name: string;
  isPlayer: boolean;
  delta: number;
  position: number;
  badge: React.ReactNode;
  lastTime?: number;
  fastestTime?: number;
};

export const DriverInfoRow = ({
  carNumber,
  name,
  isPlayer,
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
      key={carNumber}
      className={`odd:bg-slate-800 even:bg-slate-900 text-xs bg-opacity-60 [&>:first-child]:rounded-l-md [&>:last-child]:rounded-r-md text-white
         ${isPlayer ? 'text-yellow-500' : ''}`}
    >
      <td
        className={`text-center px-2 ${isPlayer ? 'bg-yellow-500 text-black' : ''}`}
      >
        {position}
      </td>
      <td className="bg-yellow-700 bg-opacity-90 border-l-2 border-yellow-500 text-right px-1 w-10">
        #{carNumber}
      </td>
      <td className={`px-2 w-full`}>{name}</td>
      <td>{badge}</td>
      <td className="px-2">{delta?.toFixed(1)}</td>
      <td className="px-2">{fastestTimeString}</td>
      <td className="px-2">{lastTimeString}</td>
    </tr>
  );
};

function formatTime(seconds?: number): string {
  if (!seconds) return '';

  const ms = Math.floor((seconds % 1) * 1000); // Get milliseconds
  const totalSeconds = Math.floor(seconds); // Get total whole seconds
  const minutes = Math.floor(totalSeconds / 60); // Get minutes
  const remainingSeconds = totalSeconds % 60; // Get remaining seconds

  // Format as mm:ss:ms
  const formattedTime = `${minutes}:${String(remainingSeconds).padStart(2, '0')}:${String(ms).padStart(3, '0')}`;
  
  return formattedTime;
}