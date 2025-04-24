import { useState } from 'react';
import { BaseSettingsSection } from '../components/BaseSettingsSection';
import { InputWidgetSettings } from '../types';
import { useDashboard } from '@irdashies/context';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { InputSettings as InputSettingsType } from '../../Input/InputContainer/InputContainer';

export const InputSettings = () => {
  const { currentDashboard } = useDashboard();
  const [settings, setSettings] = useState<InputWidgetSettings>({
    enabled:
      currentDashboard?.widgets.find((w) => w.id === 'input')?.enabled ?? false,
    config: ((currentDashboard?.widgets.find((w) => w.id === 'input')
      ?.config as unknown) as InputSettingsType),
  });

  if (!currentDashboard) {
    return <>Loading...</>;
  }

  const config = settings.config;

  return (
    <BaseSettingsSection<InputSettingsType>
      title="Input Traces Settings"
      description="Configure the input traces display settings for throttle, brake, and clutch."
      settings={settings}
      onSettingsChange={setSettings}
      widgetId="input"
    >
      {(handleConfigChange) => (
        <div className="space-y-8">
          {/* Trace Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-200">Trace Settings</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300">Enable Trace Display</span>
                <ToggleSwitch
                  enabled={config.trace.enabled}
                  onToggle={(enabled) =>
                    handleConfigChange({ trace: { ...config.trace, enabled } })
                  }
                />
              </div>
            </div>
            {config.trace.enabled && (
              <div className="space-y-2 pl-4 pt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.trace.includeThrottle}
                    onChange={(e) =>
                      handleConfigChange({
                        trace: { ...config.trace, includeThrottle: e.target.checked },
                      })
                    }
                    className="form-checkbox h-4 w-4 text-blue-500 rounded border-slate-500 bg-slate-700"
                  />
                  <span className="text-sm text-slate-200">Show Throttle Trace</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.trace.includeBrake}
                    onChange={(e) =>
                      handleConfigChange({
                        trace: { ...config.trace, includeBrake: e.target.checked },
                      })
                    }
                    className="form-checkbox h-4 w-4 text-blue-500 rounded border-slate-500 bg-slate-700"
                  />
                  <span className="text-sm text-slate-200">Show Brake Trace</span>
                </label>
              </div>
            )}
          </div>

          {/* Bar Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-200">Bar Settings</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300">Enable Bar Display</span>
                <ToggleSwitch
                  enabled={config.bar.enabled}
                  onToggle={(enabled) =>
                    handleConfigChange({ bar: { ...config.bar, enabled } })
                  }
                />
              </div>
            </div>
            {config.bar.enabled && (
              <div className="space-y-2 pl-4 pt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.bar.includeClutch}
                    onChange={(e) =>
                      handleConfigChange({
                        bar: { ...config.bar, includeClutch: e.target.checked },
                      })
                    }
                    className="form-checkbox h-4 w-4 text-blue-500 rounded border-slate-500 bg-slate-700"
                  />
                  <span className="text-sm text-slate-200">Show Clutch Bar</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.bar.includeBrake}
                    onChange={(e) =>
                      handleConfigChange({
                        bar: { ...config.bar, includeBrake: e.target.checked },
                      })
                    }
                    className="form-checkbox h-4 w-4 text-blue-500 rounded border-slate-500 bg-slate-700"
                  />
                  <span className="text-sm text-slate-200">Show Brake Bar</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.bar.includeThrottle}
                    onChange={(e) =>
                      handleConfigChange({
                        bar: { ...config.bar, includeThrottle: e.target.checked },
                      })
                    }
                    className="form-checkbox h-4 w-4 text-blue-500 rounded border-slate-500 bg-slate-700"
                  />
                  <span className="text-sm text-slate-200">Show Throttle Bar</span>
                </label>
              </div>
            )}
          </div>

          {/* Gear Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-200">Gear Settings</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300">Enable Gear Display</span>
                <ToggleSwitch
                  enabled={config.gear.enabled}
                  onToggle={(enabled) =>
                    handleConfigChange({ gear: { ...config.gear, enabled } })
                  }
                />
              </div>
            </div>
            {config.gear.enabled && (
              <div className="space-y-3 pl-4 pt-2">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-200">Speed Unit:</label>
                  <select
                    value={config.gear.unit}
                    onChange={(e) =>
                      handleConfigChange({
                        gear: {
                          ...config.gear,
                          unit: e.target.value as 'mph' | 'km/h' | 'auto',
                        },
                      })
                    }
                    className="bg-slate-700 text-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="auto">auto</option>
                    <option value="mph">mph</option>
                    <option value="km/h">km/h</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </BaseSettingsSection>
  );
};
