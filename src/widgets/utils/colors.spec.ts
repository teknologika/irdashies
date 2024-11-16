import { describe, expect, it } from 'vitest';
import { getTailwindColor } from './colors';

describe('colors', () => {
  describe('getTailwindColor', () => {
    it('should return the correct colors for the given color', () => {
      expect(getTailwindColor(16767577)).toEqual({
        driverIcon: 'bg-yellow-700 border-yellow-500',
        classHeader: 'bg-yellow-500 border-yellow-500',
      });
      expect(getTailwindColor(3395327)).toEqual({
        driverIcon: 'bg-blue-800 border-blue-500',
        classHeader: 'bg-blue-500 border-blue-500',
      });
      expect(getTailwindColor(16734344)).toEqual({
        driverIcon: 'bg-pink-800 border-pink-500',
        classHeader: 'bg-pink-500 border-pink-500',
      });
      expect(getTailwindColor(11430911)).toEqual({
        driverIcon: 'bg-purple-800 border-purple-500',
        classHeader: 'bg-purple-500 border-purple-500',
      });
      expect(getTailwindColor(16777215)).toEqual({
        driverIcon: 'bg-yellow-700 border-yellow-500',
        classHeader: 'bg-yellow-500 border-yellow-500',
      });
    });

    it('should return the default colors for an unknown color', () => {
      expect(getTailwindColor(0x123456)).toEqual({
        driverIcon: 'bg-yellow-700 border-yellow-500',
        classHeader: 'bg-yellow-500 border-yellow-500',
      });
    });
  });
});
