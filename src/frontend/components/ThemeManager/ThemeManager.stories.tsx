import { Meta } from '@storybook/react-vite';
import { ThemeManager } from './ThemeManager';
import { TelemetryDecorator } from '@irdashies/storybook';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DashboardProvider } from '@irdashies/context';
import type { DashboardBridge, DashboardLayout } from '@irdashies/types';
import { useState } from 'react';
import { WIDGET_MAP } from '../../WidgetIndex';
import { defaultDashboard } from '../../../app/storage/defaultDashboard';

const meta: Meta<typeof ThemeManager> = {
  component: ThemeManager,
  decorators: [TelemetryDecorator('/test-data/1747384033336')],
};

export default meta;

// Helper function to create a mock dashboard bridge
const createMockBridge = (
  fontSize: 'xs' | 'sm' | 'lg' | 'xl',
  setFontSize: (size: 'xs' | 'sm' | 'lg' | 'xl') => void,
  widgets: DashboardLayout['widgets'] = []
): DashboardBridge => ({
  reloadDashboard: () => {
    // noop
  },
  saveDashboard: (dashboard: DashboardLayout) => {
    // Update the font size in the dashboard
    setFontSize(dashboard.generalSettings?.fontSize || 'sm');
  },
  dashboardUpdated: (callback) => {
    // Initialize with current font size
    callback({
      widgets,
      generalSettings: { fontSize },
    });
    return () => {
      // noop
    };
  },
  onEditModeToggled: (callback) => {
    callback(false);
    return () => {
      // noop
    };
  },
  toggleLockOverlays: () => Promise.resolve(true),
  getAppVersion: () => Promise.resolve('0.0.7+mock'),
  resetDashboard: () =>
    Promise.resolve({
      widgets: [],
      generalSettings: { fontSize },
    }),
});

// Helper function to create font size buttons
const createFontSizeButtons = (
  fontSize: 'xs' | 'sm' | 'lg' | 'xl',
  mockBridge: DashboardBridge
) => {
  const getButtonClass = (size: 'xs' | 'sm' | 'lg' | 'xl') => {
    const baseClass = 'px-2 py-1 rounded transition-colors';
    return size === fontSize
      ? `${baseClass} bg-blue-700 text-white`
      : `${baseClass} bg-blue-500 text-white hover:bg-blue-600`;
  };

  return (
    <div className="flex gap-2">
      <button
        className={getButtonClass('xs')}
        onClick={() =>
          mockBridge.saveDashboard({
            widgets: [],
            generalSettings: { fontSize: 'xs' },
          })
        }
      >
        Extra Small
      </button>
      <button
        className={getButtonClass('sm')}
        onClick={() =>
          mockBridge.saveDashboard({
            widgets: [],
            generalSettings: { fontSize: 'sm' },
          })
        }
      >
        Small
      </button>
      <button
        className={getButtonClass('lg')}
        onClick={() =>
          mockBridge.saveDashboard({
            widgets: [],
            generalSettings: { fontSize: 'lg' },
          })
        }
      >
        Large
      </button>
      <button
        className={getButtonClass('xl')}
        onClick={() =>
          mockBridge.saveDashboard({
            widgets: [],
            generalSettings: { fontSize: 'xl' },
          })
        }
      >
        Extra Large
      </button>
    </div>
  );
};

export const Primary = {
  render: () => {
    return (
      <MemoryRouter initialEntries={['/']}>
        <ThemeManager>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <div className="text-xs">text-xs</div>
                  <div className="text-sm">text-sm</div>
                  <div className="text-base">text-base</div>
                  <div className="text-lg">text-lg</div>
                  <div className="text-xl">text-xl</div>
                </>
              }
            ></Route>
          </Routes>
        </ThemeManager>
      </MemoryRouter>
    );
  },
};

export const WithFontSizeControls = {
  render: () => {
    const [fontSize, setFontSize] = useState<'xs' | 'sm' | 'lg' | 'xl'>('sm');
    const mockBridge = createMockBridge(fontSize, setFontSize);

    return (
      <DashboardProvider bridge={mockBridge}>
        <MemoryRouter initialEntries={['/']}>
          <ThemeManager>
            <div className="p-4 space-y-4">
              {createFontSizeButtons(fontSize, mockBridge)}
              <div className="space-y-2">
                <div className="text-xs">This is extra small text</div>
                <div className="text-sm">This is small text</div>
                <div className="text-base">This is base text</div>
                <div className="text-lg">This is large text</div>
                <div className="text-xl">This is extra large text</div>
              </div>
            </div>
          </ThemeManager>
        </MemoryRouter>
      </DashboardProvider>
    );
  },
};

export const WithAllAvailableWidgets = {
  render: () => {
    const [fontSize, setFontSize] = useState<'xs' | 'sm' | 'lg' | 'xl'>('sm');
    const mockBridge = createMockBridge(fontSize, setFontSize, defaultDashboard.widgets);

    return (
      <DashboardProvider bridge={mockBridge}>
        <MemoryRouter initialEntries={['/']}>
          <ThemeManager>
            <div className="p-4 space-y-4">
              {createFontSizeButtons(fontSize, mockBridge)}
            </div>
            <hr className="my-4" />
            <Routes>
              <Route
                path="/"
                element={
                  <div>
                    {Object.entries(WIDGET_MAP).map(([key, Widget]) => (
                      <div key={key}>
                        <h2 className="text-md font-bold m-2 uppercase">{key}</h2>
                        <div className="min-h-24 pb-12">
                          <Widget />
                        </div>
                      </div>
                    ))}
                  </div>
                }
              />
            </Routes>
          </ThemeManager>
        </MemoryRouter>
      </DashboardProvider>
    );
  },
};
