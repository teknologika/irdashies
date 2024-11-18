import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TelemetryProvider, useTelemetry } from './TelemetryContext';
import type { IrSdkBridge } from '../../../bridge/iracingSdk/irSdkBridge.type';
import type { SessionData, TelemetryVarList } from '@irsdk-node/types';

const mockBridge: IrSdkBridge = {
  onTelemetry: vi.fn(),
  onSessionData: vi.fn(),
  onRunningState: vi.fn(),
  stop: vi.fn(),
};

const TestComponent: React.FC = () => {
  const { telemetry, session } = useTelemetry();
  return (
    <div>
      <div data-testid="telemetry">
        {telemetry ? `Brake ${telemetry.Brake?.value?.[0]}` : 'No Telemetry'}
      </div>
      <div data-testid="session">
        {session ? `Track ${session.WeekendInfo?.TrackName}` : 'No Session'}
      </div>
    </div>
  );
};

describe('TelemetryContext', () => {
  it('renders children correctly', () => {
    render(
      <TelemetryProvider bridge={mockBridge}>
        <div>Child Component</div>
      </TelemetryProvider>
    );
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('provides telemetry data', async () => {
    // mock data being sent to mockBridge when onTelemetry and onSessionData are called
    vi.spyOn(mockBridge, 'onTelemetry').mockImplementation((cb) =>
      cb({
        Brake: {
          countAsTime: false,
          length: 1,
          name: 'Brake',
          description: '0=brake released to 1=max pedal force',
          unit: '%',
          varType: 4,
          value: [0.5],
        },
      } as TelemetryVarList)
    );

    render(
      <TelemetryProvider bridge={mockBridge}>
        <TestComponent />
      </TelemetryProvider>
    );

    expect(screen.getByTestId('telemetry')).toHaveTextContent('Brake 0.5');
  });

  it('provides session data', async () => {
    // mock data being sent to mockBridge when onTelemetry and onSessionData are called
    vi.spyOn(mockBridge, 'onSessionData').mockImplementation((cb) =>
      cb({
        WeekendInfo: {
          TrackName: 'Mount Panorama',
        },
      } as SessionData)
    );

    render(
      <TelemetryProvider bridge={mockBridge}>
        <TestComponent />
      </TelemetryProvider>
    );

    expect(screen.getByTestId('session')).toHaveTextContent(
      'Track Mount Panorama'
    );
  });

  it('calls onTelemetry and onSessionData when bridge is resolved', async () => {
    render(
      <TelemetryProvider bridge={Promise.resolve(mockBridge)}>
        <TestComponent />
      </TelemetryProvider>
    );

    await vi.waitFor(() => {
      expect(mockBridge.onTelemetry).toHaveBeenCalled();
      expect(mockBridge.onSessionData).toHaveBeenCalled();
    });
  });

  it('throws error when useTelemetry is used outside of TelemetryProvider', () => {
    const consoleError = console.error;
    console.error = vi.fn(); // Suppress error output in test

    expect(() => render(<TestComponent />)).toThrow(
      'useTelemetry must be used within a TelemetryProvider'
    );

    console.error = consoleError; // Restore original console.error
  });
});
