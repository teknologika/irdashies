import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { TelemetryProvider } from './TelemetryContext/TelemetryContext';
import { Input } from './Input';

const App = () => (
  <TelemetryProvider>
    <HashRouter>
      <Routes>
        <Route path="/input" element={<Input />} />
        <Route
          path="*"
          element={
            <div className="bg-slate-500 h-screen w-screen flex justify-center items-center text-white">
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
