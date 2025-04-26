import { Drop, Sun } from '@phosphor-icons/react';

export interface WeatherTrackWetnessProps {
  trackWetnessPct: number;
  trackState: string;
}

export const WeatherTrackWetness = ({
  trackWetnessPct,
  trackState,
}: WeatherTrackWetnessProps) => {
  return (
    <div className="bg-slate-800/70 p-2 rounded-sm">
      <div className="flex items-center flex-row gap-x-1 mt-1">
        <Sun />
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            style={{ width: `${trackWetnessPct}%` }}
            className="bg-blue-600 h-2.5 rounded-full"
          ></div>
        </div>
        <Drop />
      </div>
      <div className="text-center text-sm mt-1">{trackState ?? 'Unknown'}</div>
    </div>
  );
};
