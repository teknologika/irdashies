export interface InputGearProps {
  gear: number;
  speedMs: number;
}

export const InputGear = ({ gear, speedMs }: InputGearProps) => {
  const speed = speedMs * 3.6;
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
    <div className="flex items-center justify-center font-mono p-2">
      <div className="flex flex-col items-center">
        <div className="text-4xl font-bold">{gearText}</div>
        <div className="text-l">{speed.toFixed(0)}</div>
      </div>
    </div>
  );
};
