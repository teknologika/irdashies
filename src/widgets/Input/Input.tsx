import { InputBar } from "../InputBar/InputBar";
import { InputGear } from "../InputGear/InputGear";
import { InputTrace } from "../InputTrace/InputTrace";

export interface InputProps {
  brake: number;
  throttle: number;
  clutch: number;
  gear: number;
  speed: number;
}

export const Input = ({ brake, throttle, clutch, gear, speed }: InputProps) => {
  return (
    <div className="inline-flex gap-1 p-2 rounded-md flex-row border-1 bg-slate-800 bg-opacity-50">
      <InputTrace brake={brake} throttle={throttle} />
      <InputBar brake={brake} throttle={throttle} clutch={clutch} />
      <InputGear gear={gear} speed={speed} />
    </div>
  );
}