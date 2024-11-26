import { describe, it, expect } from 'vitest';
import { formatTime, formatTimeShort } from './time';

describe('time', () => {
  describe('formatTime', () => {
    it('should return an empty string if no seconds are provided', () => {
      expect(formatTime()).toBe('');
    });

    it('should format time correctly for whole seconds', () => {
      expect(formatTime(75)).toBe('1:15:000');
    });

    it('should format time correctly for seconds with milliseconds', () => {
      expect(formatTime(75.123)).toBe('1:15:123');
    });

    it('should format time correctly for less than a minute', () => {
      expect(formatTime(45)).toBe('0:45:000');
    });

    it('should format time correctly for exactly one minute', () => {
      expect(formatTime(60)).toBe('1:00:000');
    });

    it('should return empty string for zero seconds', () => {
      expect(formatTime(0)).toBe('');
    });

    it('should format time correctly for less than a second', () => {
      expect(formatTime(0.456)).toBe('0:00:456');
    });

    it('should format time correctly for more than an hour', () => {
      expect(formatTime(3661.789)).toBe('61:01:789');
    });

    it('should round time correctly for higher precision sub second', () => {
      expect(formatTime(0.4562335)).toBe('0:00:456');
    });

    it('should return empty string for -1 time', () => {
      expect(formatTime(-1)).toBe('');
    });
  });

  describe('formatTimeShort', () => {
    it('should return an empty string if no seconds are provided', () => {
      expect(formatTimeShort()).toBe('');
    });

    it('should format time correctly for whole seconds', () => {
      expect(formatTimeShort(75)).toBe('1:15');
    });

    it('should format time correctly for seconds with milliseconds', () => {
      expect(formatTimeShort(75.123)).toBe('1:15');
    });

    it('should format time correctly for less than a minute', () => {
      expect(formatTimeShort(45)).toBe('0:45');
    });

    it('should format time correctly for exactly one minute', () => {
      expect(formatTimeShort(60)).toBe('1:00');
    });

    it('should return empty string for zero seconds', () => {
      expect(formatTimeShort(0)).toBe('');
    });

    it('should format time correctly for less than a second', () => {
      expect(formatTimeShort(0.456)).toBe('0:00');
    });

    it('should format time correctly for more than an hour', () => {
      expect(formatTimeShort(3661.789)).toBe('61:01');
    });

    it('should round time correctly for higher precision sub second', () => {
      expect(formatTimeShort(0.4562335)).toBe('0:00');
    });

    it('should return empty string for -1 time', () => {
      expect(formatTime(-1)).toBe('');
    });
  });
});
