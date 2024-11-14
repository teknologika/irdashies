import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { TelemetryProvider } from './context/TelemetryContext/TelemetryContext';
import { Input } from './components/Input';
import { Standings } from './components/Standings/Standings';
import { Settings } from './components/Settings/Settings';
import { DashboardProvider } from './context/DashboardContext/DashboardContext';
import {
  RunningStateProvider,
  withRunningChecker,
} from './context/RunningStateContext/RunningStateContext';

// I don't really know why interface.d.ts isn't being picked up so just redefining it here.
declare global {
  interface Window {
    irsdkBridge: import('./../bridge/iracingSdk/irSdkBridge.type').IrSdkBridge;
    dashboardBridge: import('./../bridge/dashboard/dashboardBridge.type').DashboardBridge;
  }
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/input" element={withRunningChecker(<Input />)} />
      <Route path="/standings" element={withRunningChecker(<Standings />)} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};

const App = () => (
  <DashboardProvider bridge={window.dashboardBridge}>
    <RunningStateProvider bridge={window.irsdkBridge}>
      <TelemetryProvider bridge={window.irsdkBridge}>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </TelemetryProvider>
    </RunningStateProvider>
  </DashboardProvider>
);

const el = document.getElementById('app');
if (!el) {
  throw new Error('No #app element found');
}

const root = createRoot(el);
root.render(<App />);
