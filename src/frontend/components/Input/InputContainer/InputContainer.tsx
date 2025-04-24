import { InputBar } from '../InputBar/InputBar';
import { InputGear } from '../InputGear/InputGear';
import { InputTrace } from '../InputTrace/InputTrace';

export interface InputProps {
  brake?: number;
  throttle?: number;
  clutch?: number;
  gear?: number;
  speed?: number;
  unit?: number;
  settings?: InputSettings;
}

export interface InputSettings {
  trace: {
    enabled: boolean;
    includeThrottle: boolean;
    includeBrake: boolean;
  };
  bar: {
    enabled: boolean;
    includeClutch: boolean;
    includeBrake: boolean;
    includeThrottle: boolean;
  };
  gear: {
    enabled: boolean;
    unit: 'mph' | 'km/h' | 'auto';
  };
}

export const InputContainer = ({
  brake,
  throttle,
  clutch,
  gear,
  speed,
  unit,
  settings,
}: InputProps) => {
  return (
    <div className="w-full h-full inline-flex gap-1 p-2 flex-row bg-slate-800/50">
      {settings?.trace.enabled && <InputTrace input={{ brake, throttle }} settings={settings.trace} />}
      {settings?.bar.enabled && <InputBar brake={brake} throttle={throttle} clutch={clutch} settings={settings.bar} />}
      {settings?.gear.enabled && <InputGear gear={gear} speedMs={speed} unit={unit} settings={settings.gear} />}
      {/* <InputSteer /> */} {/* WIP */}
    </div>
  );
};
