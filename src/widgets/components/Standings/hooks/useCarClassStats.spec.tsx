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
        },
        {
          CarClassID: '1',
          CarClassColor: 123456,
          CarClassShortName: 'GT3',
        },
        {
          CarClassID: '2',
          CarClassColor: 654321,
          CarClassShortName: 'LMP2',
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
        total: 2,
        color: 123456,
        shortName: 'GT3',
      },
      '2': {
        total: 1,
        color: 654321,
        shortName: 'LMP2',
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
