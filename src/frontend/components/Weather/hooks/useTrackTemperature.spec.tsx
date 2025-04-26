import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTrackTemperature } from './useTrackTemperature';
import type { TelemetryVar } from '@irdashies/types';
import { useTelemetry } from '@irdashies/context';

vi.mock('@irdashies/context');

describe('useTrackTemperature', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockTelemetryVar = (value: number[], unit?: string): TelemetryVar<number[]> => ({
    value,
    name: 'Mock',
    description: 'Mock telemetry variable',
    unit: unit ?? '',
    countAsTime: false,
    length: value.length,
    varType: 0,
  });

  it('should return the track temperature', () => {
    vi.mocked(useTelemetry).mockImplementation((key) => {
      const mockValues = {
        TrackTempCrew: mockTelemetryVar([25], 'C'),
        AirTemp: mockTelemetryVar([25], 'C'),
      };
      return mockValues[key as keyof typeof mockValues];
    });

    const { result } = renderHook(() => useTrackTemperature());

    expect(result.current.trackTemp).toBe('25°C');
    expect(result.current.airTemp).toBe('25°C');
  });
  it('should return an empty string if the telemetry variable is not found', () => {
    vi.mocked(useTelemetry).mockImplementation(() => {
      return mockTelemetryVar([], '');
    });

    const { result } = renderHook(() => useTrackTemperature());

    expect(result.current.trackTemp).toBe('0°C');
    expect(result.current.airTemp).toBe('0°C');
  });

  it('should return temperature in Fahrenheit if the unit is Fahrenheit', () => {
    vi.mocked(useTelemetry).mockImplementation(() => {
      return mockTelemetryVar([77], 'F');
    });

    const { result } = renderHook(() => useTrackTemperature());

    expect(result.current.trackTemp).toBe('77°F');
    expect(result.current.airTemp).toBe('77°F');
  });
});
