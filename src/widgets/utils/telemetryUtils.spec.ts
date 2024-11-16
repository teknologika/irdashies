import { describe, it, expect } from 'vitest';
import { getSingleNumberValue } from './telemetryUtils';
import type { TelemetryVariable } from '@irsdk-node/types';

describe('telemetryUtils', () => {
  describe('getSingleNumberValue', () => {
    it('should return the first number in the array if telemetryValue is defined', () => {
      const telemetryValue = {
        value: [42],
      } as TelemetryVariable<number[]>;
      expect(getSingleNumberValue(telemetryValue)).toBe(42);
    });

    it('should return 0 if telemetryValue is undefined', () => {
      expect(getSingleNumberValue(undefined)).toBe(0);
    });

    it('should return 0 if telemetryValue.value is undefined', () => {
      const telemetryValue = {
        value: undefined,
      } as unknown as TelemetryVariable<number[]>;
      expect(getSingleNumberValue(telemetryValue)).toBe(0);
    });

    it('should return 0 if telemetryValue.value is an empty array', () => {
      const telemetryValue = { value: [] as number[] } as TelemetryVariable<
        number[]
      >;
      expect(getSingleNumberValue(telemetryValue)).toBe(0);
    });
  });
});
