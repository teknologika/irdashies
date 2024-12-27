export interface InputGearProps {
  gear?: number;
  speedMs?: number;
  unit?: number;
}

export const InputGear = ({ gear, speedMs, unit }: InputGearProps) => {
  const isMetric = unit === 1;
  const speed = (speedMs ?? 0) * (isMetric ? 3.6 : 2.23694);
  const displayUnit = isMetric ? 'km/h' : 'mph';
  let gearText = '';
  switch (gear) {
    case -1:
      gearText = 'R';
      break;
    case 0:
      gearText = 'N';
      break;
    default:
      gearText = `${gear}`;
      break;
  }

  return (
    <div className="flex items-center justify-center font-mono p-2 w-[120px]">
      <div className="flex flex-col items-center">
        <div className="text-4xl font-bold leading-none">{gearText}</div>
        <div className="text-l">{speed.toFixed(0)}</div>
        <div className="text-xs text-gray-500 leading-none">{displayUnit}</div>
      </div>
    </div>
  );
};
