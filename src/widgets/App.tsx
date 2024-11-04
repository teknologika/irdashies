import { createRoot } from 'react-dom/client';
import { Input } from './Input/Input';
import {
  TelemetryProvider,
  useTelemetry,
} from './TelemetryContext/TelemetryContext';

const App = () => {
  const { telemetryData } = useTelemetry();
  return (
    <Input
      brake={telemetryData?.Brake?.value?.[0] ?? 0}
      throttle={telemetryData?.Throttle.value?.[0] ?? 0}
      clutch={telemetryData?.Clutch.value?.[0] ?? 0}
      gear={telemetryData?.Gear.value?.[0] ?? 0}
      speed={telemetryData?.Speed.value?.[0] ?? 0}
    />
  );
};

const root = createRoot(document.body);
root.render(
  <TelemetryProvider>
    <App />
  </TelemetryProvider>,
);
