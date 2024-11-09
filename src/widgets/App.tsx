import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { TelemetryProvider } from './TelemetryContext/TelemetryContext';
import { Input } from './Input';
import { Standings } from './Standings/Standings';

const App = () => (
  <TelemetryProvider bridge={window.irsdkBridge}>
    <HashRouter>
      <Routes>
        <Route path="/input" element={<Input />} />
        <Route path="/standings" element={<Standings />} />
        <Route
          path="*"
          element={
            <div className="bg-slate-500 h-screen w-screen flex justify-center items-center">
              Unknown Widget
            </div>
          }
        />
      </Routes>
    </HashRouter>
  </TelemetryProvider>
);

const el = document.getElementById('app');
if (!el) {
  throw new Error('No #app element found');
}

const root = createRoot(el);
root.render(<App />);
