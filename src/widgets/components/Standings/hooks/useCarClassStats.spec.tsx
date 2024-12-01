import { renderHook } from '@testing-library/react';
import { useCarClassStats } from './useCarClassStats';
import { describe, it, vi, expect } from 'vitest';
import { useTelemetry } from '../../../context/TelemetryContext';
import { Session } from '../../../../bridge/iracingSdk';

vi.mock('../../../context/TelemetryContext');

describe('useCarClassStats', () => {
  const mockSession = {
    DriverInfo: {
      Drivers: [
        {
          CarClassID: '1',
          CarClassColor: 123456,
          CarClassShortName: 'GT3',
          IRating: 1000,
        },
        {
          CarClassID: '1',
          CarClassColor: 123456,
          CarClassShortName: 'GT3',
          IRating: 2000,
        },
        {
          CarClassID: '1',
          CarClassColor: 123456,
          CarClassShortName: 'GT3',
          IRating: 2250,
        },
        {
          CarClassID: '1',
          CarClassColor: 123456,
          CarClassShortName: 'GT3',
          IRating: 1950,
        },
        {
          CarClassID: '2',
          CarClassColor: 654321,
          CarClassShortName: 'LMP2',
          IRating: 3000,
        },
      ],
    },
  } as unknown as Session;

  it('should return correct class stats', () => {
    vi.mocked(useTelemetry).mockReturnValue({
      session: mockSession,
    });
    const { result } = renderHook(() => useCarClassStats());

    expect(result.current).toEqual({
      '1': {
        total: 4,
        color: 123456,
        shortName: 'GT3',
        sof: 1800,
      },
      '2': {
        total: 1,
        color: 654321,
        shortName: 'LMP2',
        sof: 3000,
      },
    });
  });

  it('should not error if session is not available', () => {
    vi.mocked(useTelemetry).mockReturnValue({
      session: undefined,
    });
    const { result } = renderHook(() => useCarClassStats());

    expect(result.current).toBeUndefined();
  });
});
