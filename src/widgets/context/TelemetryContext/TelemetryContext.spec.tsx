import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TelemetryProvider, useTelemetry } from './TelemetryContext';
import type { IrSdkBridge } from '../../../bridge/iracingSdk/irSdkBridge.type';

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
        {telemetry ? 'Telemetry Data' : 'No Telemetry'}
      </div>
      <div data-testid="session">{session ? 'Session Data' : 'No Session'}</div>
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

  it('provides telemetry and session data', () => {
    render(
      <TelemetryProvider bridge={mockBridge}>
        <TestComponent />
      </TelemetryProvider>
    );
    expect(screen.getByTestId('telemetry')).toHaveTextContent('No Telemetry');
    expect(screen.getByTestId('session')).toHaveTextContent('No Session');
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
