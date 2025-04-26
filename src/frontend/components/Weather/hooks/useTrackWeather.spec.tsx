import { useTelemetry } from '@irdashies/context';
import { TelemetryVar } from '@irdashies/types';
import { renderHook } from '@testing-library/react';
import { describe, beforeEach, vi, it, expect } from 'vitest';
import { useTrackWeather } from './useTrackWeather';

vi.mock('@irdashies/context');

describe('useTrackWeather', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockTelemetryVar = (value: number[]): TelemetryVar<number[]> => ({
    value,
    name: 'Mock',
    description: 'Mock telemetry variable',
    unit: '',
    countAsTime: false,
    length: value.length,
    varType: 0,
  });

  it('should return track weather data from telemetry values', () => {
    vi.mocked(useTelemetry).mockImplementation((key) => {
      const mockValues = {
        TrackWetness: mockTelemetryVar([2]),
        YawNorth: mockTelemetryVar([45]),
        WindDir: mockTelemetryVar([270]),
        WindVel: mockTelemetryVar([8.3]),
      };
      return mockValues[key as keyof typeof mockValues];
    });

    const { result } = renderHook(() => useTrackWeather());

    expect(result.current).toEqual({
      trackState: 'Mostly Dry',
      trackMoisture: mockTelemetryVar([2]),
      windDirection: mockTelemetryVar([270]),
      windVelo: mockTelemetryVar([8.3]),
      windYaw: mockTelemetryVar([45]),
    });
  });

  it('should handle undefined telemetry values', () => {
    const mockFn = vi.fn();
    mockFn.mockReturnValue(undefined);
    vi.mocked(useTelemetry).mockImplementation(mockFn);

    const { result } = renderHook(() => useTrackWeather());

    expect(result.current).toEqual({
      trackState: '',
      trackMoisture: undefined,
      windDirection: undefined,
      windVelo: undefined,
      windYaw: undefined,
    });
  });

  it('should return correct track state for different wetness levels', () => {
    const testCases = [
      { wetness: 0, expected: '' },
      { wetness: 1, expected: 'Dry' },
      { wetness: 2, expected: 'Mostly Dry' },
      { wetness: 3, expected: 'Very Lightly Wet' },
      { wetness: 4, expected: 'Lightly Wet' },
      { wetness: 5, expected: 'Moderately Wet' },
      { wetness: 6, expected: 'Very Wet' },
      { wetness: 7, expected: 'Extremely Wet' },
      { wetness: 8, expected: '' }, // Invalid wetness level
    ];

    testCases.forEach(({ wetness, expected }) => {
      vi.mocked(useTelemetry).mockImplementation((key) => {
        return key === 'TrackWetness' ? mockTelemetryVar([wetness]) : mockTelemetryVar([0]);
      });

      const { result } = renderHook(() => useTrackWeather());
      expect(result.current.trackState).toBe(expected);
    });
  });
});
