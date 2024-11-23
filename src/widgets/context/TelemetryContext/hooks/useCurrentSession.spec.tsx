import { renderHook } from '@testing-library/react';
import { useCurrentSession } from './useCurrentSession';
import { describe, expect, it, vi } from 'vitest';
import { useTelemetry } from '../TelemetryContext';
import type { SessionData, TelemetryVarList } from '@irsdk-node/types';

vi.mock('../TelemetryContext');

describe('useCurrentSession', () => {
  it('returns null if session is not available', () => {
    vi.mocked(useTelemetry).mockReturnValue({
      session: {} as SessionData,
      telemetry: {} as TelemetryVarList,
    });
    const { result } = renderHook(() => useCurrentSession());

    expect(result.current).toBeNull();
  });

  it('returns the correct session if session and telemetry are available', () => {
    const mockSession = {
      SessionInfo: {
        Sessions: [
          { SessionNum: 1, name: 'Session 1' },
          { SessionNum: 2, name: 'Session 2' },
        ],
      },
    } as unknown as SessionData;
    const mockTelemetry = {
      SessionNum: { value: [2] },
    } as TelemetryVarList;

    vi.mocked(useTelemetry).mockReturnValue({
      session: mockSession,
      telemetry: mockTelemetry,
    });

    const { result } = renderHook(() => useCurrentSession());

    expect(result.current).toEqual({ SessionNum: 2, name: 'Session 2' });
  });

  it('returns null if no matching session is found', () => {
    const mockSession = {
      SessionInfo: {
        Sessions: [
          { SessionNum: 1, name: 'Session 1' },
          { SessionNum: 2, name: 'Session 2' },
        ],
      },
    } as unknown as SessionData;
    const mockTelemetry = {
      SessionNum: { value: [3] },
    } as TelemetryVarList;

    vi.mocked(useTelemetry).mockReturnValue({
      session: mockSession,
      telemetry: mockTelemetry,
    });

    const { result } = renderHook(() => useCurrentSession());

    expect(result.current).toBeNull();
  });

  it('returns null if telemetry session number is not available', () => {
    const mockSession = {
      SessionInfo: {
        Sessions: [
          { SessionNum: 1, name: 'Session 1' },
          { SessionNum: 2, name: 'Session 2' },
        ],
      },
    } as unknown as SessionData;
    const mockTelemetry = {
      SessionNum: { value: [] as number[] },
    } as TelemetryVarList;

    vi.mocked(useTelemetry).mockReturnValue({
      session: mockSession,
      telemetry: mockTelemetry,
    });

    const { result } = renderHook(() => useCurrentSession());

    expect(result.current).toBeNull();
  });
});
