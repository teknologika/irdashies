import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTrackTemperature } from './hooks/useTrackTemperature';
import { useTrackWeather } from './hooks/useTrackWeather';
import { WeatherTemp } from './WeatherTemp/WeatherTemp';
import { WeatherTrackWetness } from './WeatherTrackWetness/WeatherTrackWetness';
import { WindDirection } from './WindDirection/WindDirection';

export const Weather = () => {
  const [parent] = useAutoAnimate();
  const weather = useTrackWeather();
  const trackWetnessPct = Math.floor(
    (Number(weather.trackMoisture?.value?.[0] ?? 0) / 7) * 100
  );

  const trackTemp = useTrackTemperature();
  const windSpeed = weather.windVelo?.value[0] * (18 / 5);
  const windDirectionValue =
    weather.windDirection?.value[0] - weather.windYaw?.value[0];

  return (
    <div
      className="w-full inline-flex flex-row bg-slate-800/25 rounded-sm"
      ref={parent}
    >
      <div className="flex flex-col p-2 w-full rounded-sm gap-2">
        <WeatherTemp title="Track" value={trackTemp.trackTemp} />
        <WeatherTemp title="Air" value={trackTemp.airTemp} />
        <WindDirection speed={windSpeed} direction={windDirectionValue} />
        <WeatherTrackWetness
          trackWetnessPct={trackWetnessPct}
          trackState={weather.trackState}
        />
      </div>
    </div>
  );
};
