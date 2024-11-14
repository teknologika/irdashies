import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { TelemetryProvider } from './TelemetryContext/TelemetryContext';
import { Input } from './Input';
import { Standings } from './Standings/Standings';
import { Settings } from './Settings/Settings';
import { withDashboard } from './DashboardContext/DashboardContext';
import { ReactNode } from 'react';
import {
  RunningStateProvider,
  useRunningState,
} from './RunningStateContext/RunningStateContext';

// This conditionally renders the children based on whether the sim is running.
const withRunningChecker = (C: ReactNode) => {
  const { running } = useRunningState();
  if (!running) {
    return <></>;
  }
  return C;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/input" element={withRunningChecker(<Input />)} />
      <Route path="/standings" element={withRunningChecker(<Standings />)} />
      <Route
        path="/settings"
        element={withDashboard(window.dashboardBridge)(<Settings />)}
      />
    </Routes>
  );
};

const App = () => (
  <RunningStateProvider bridge={window.irsdkBridge}>
    <TelemetryProvider bridge={window.irsdkBridge}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </TelemetryProvider>
  </RunningStateProvider>
);

const el = document.getElementById('app');
if (!el) {
  throw new Error('No #app element found');
}

const root = createRoot(el);
root.render(<App />);
