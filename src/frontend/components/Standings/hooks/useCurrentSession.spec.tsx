import { renderHook } from '@testing-library/react';
import { useCurrentSession } from './useCurrentSession';
import { describe, expect, it, vi } from 'vitest';
import { useSession, useTelemetry } from '@irdashies/context';
import type { Session, Telemetry } from '../../../../bridge/iracingSdk';

vi.mock('@irdashies/context');

describe('useCurrentSession', () => {
  it('returns undefined if session is not available', () => {
    vi.mocked(useTelemetry).mockReturnValue({
      telemetry: {} as Telemetry,
    });
    vi.mocked(useSession).mockReturnValue({
      session: {} as Session,
    });
    const { result } = renderHook(() => useCurrentSession());

    expect(result.current).toBeUndefined();
  });

  it('returns the correct session if session and telemetry are available', () => {
    const mockSession = {
      SessionInfo: {
        Sessions: [
          { SessionNum: 1, name: 'Session 1' },
          { SessionNum: 2, name: 'Session 2' },
        ],
      },
    } as unknown as Session;
    const mockTelemetry = {
      SessionNum: { value: [2] },
    } as Telemetry;

    vi.mocked(useTelemetry).mockReturnValue({
      telemetry: mockTelemetry,
    });
    vi.mocked(useSession).mockReturnValue({
      session: mockSession,
    });

    const { result } = renderHook(() => useCurrentSession());

    expect(result.current).toEqual({ SessionNum: 2, name: 'Session 2' });
  });

  it('returns undefined if no matching session is found', () => {
    const mockSession = {
      SessionInfo: {
        Sessions: [
          { SessionNum: 1, name: 'Session 1' },
          { SessionNum: 2, name: 'Session 2' },
        ],
      },
    } as unknown as Session;
    const mockTelemetry = {
      SessionNum: { value: [3] },
    } as Telemetry;

    vi.mocked(useTelemetry).mockReturnValue({
      telemetry: mockTelemetry,
    });
    vi.mocked(useSession).mockReturnValue({
      session: mockSession,
    });

    const { result } = renderHook(() => useCurrentSession());

    expect(result.current).toBeUndefined();
  });

  it('returns undefined if telemetry session number is not available', () => {
    const mockSession = {
      SessionInfo: {
        Sessions: [
          { SessionNum: 1, name: 'Session 1' },
          { SessionNum: 2, name: 'Session 2' },
        ],
      },
    } as unknown as Session;
    const mockTelemetry = {
      SessionNum: { value: [] as number[] },
    } as Telemetry;

    vi.mocked(useTelemetry).mockReturnValue({
      telemetry: mockTelemetry,
    });
    vi.mocked(useSession).mockReturnValue({
      session: mockSession,
    });

    const { result } = renderHook(() => useCurrentSession());

    expect(result.current).toBeUndefined();
  });
});
