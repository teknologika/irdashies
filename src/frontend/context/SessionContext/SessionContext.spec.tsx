import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SessionProvider, useSession } from './SessionContext';
import type { Session, IrSdkBridge } from '@irdashies/types';

const mockBridge: IrSdkBridge = {
  onTelemetry: vi.fn(),
  onSessionData: vi.fn(),
  onRunningState: vi.fn(),
  stop: vi.fn(),
};

const TestComponent: React.FC = () => {
  const { session } = useSession();
  return (
    <div>
      <div data-testid="session">
        {session ? `Track ${session.WeekendInfo?.TrackName}` : 'No Session'}
      </div>
    </div>
  );
};

describe('TelemetryContext', () => {
  it('renders children correctly', () => {
    render(
      <SessionProvider bridge={mockBridge}>
        <div>Child Component</div>
      </SessionProvider>
    );
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('provides session data', async () => {
    // mock data being sent to mockBridge when onTelemetry and onSessionData are called
    vi.spyOn(mockBridge, 'onSessionData').mockImplementation((cb) =>
      cb({
        WeekendInfo: {
          TrackName: 'Mount Panorama',
        },
      } as Session)
    );

    render(
      <SessionProvider bridge={mockBridge}>
        <TestComponent />
      </SessionProvider>
    );

    expect(screen.getByTestId('session')).toHaveTextContent(
      'Track Mount Panorama'
    );
  });

  it('calls onSessionData when bridge is resolved', async () => {
    render(
      <SessionProvider bridge={Promise.resolve(mockBridge)}>
        <TestComponent />
      </SessionProvider>
    );

    await act(async () => {
      await vi.waitFor(() => {
        expect(mockBridge.onSessionData).toHaveBeenCalled();
      });
    });
  });

  it('throws error when useTelemetry is used outside of SessionProvider', () => {
    const consoleError = console.error;
    console.error = vi.fn(); // Suppress error output in test

    expect(() => render(<TestComponent />)).toThrow(
      'useSession must be used within a SessionProvider'
    );

    console.error = consoleError; // Restore original console.error
  });
});
