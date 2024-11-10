type DriverRowInfoProps = {
  carNumber: number;
  name: string;
  isPlayer: boolean;
  delta: number;
  position: number;
  badge: React.ReactNode;
};

export const DriverInfoRow = ({
  carNumber,
  name,
  isPlayer,
  delta,
  position,
  badge,
}: DriverRowInfoProps) => {
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
    </tr>
  );
};
