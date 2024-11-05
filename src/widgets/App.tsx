import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
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

const el = document.getElementById('app');
if (!el) {
  throw new Error('No #app element found');
}

const root = createRoot(el);
root.render(
  <TelemetryProvider>
    <HashRouter>
      <Routes>
        <Route path="/input" element={<App />} />
        <Route
          path="/relative"
          element={<div className="text-white text-lg">Relative</div>}
        />
      </Routes>
    </HashRouter>
  </TelemetryProvider>
);
