import { describe, expect, it } from 'vitest';
import { getTailwindStyle } from './colors';

describe('colors', () => {
  describe('getTailwindColor', () => {
    it.each([16767577, 3395327, 16734344, 11430911, 16777215])(
      'should return the correct colors for iracing defined colour: %s',
      (color) => {
        expect(getTailwindStyle(color)).toBeDefined();
      }
    );

    it('should return the default colors for an unknown color', () => {
      expect(getTailwindStyle(0x123456)).toEqual({
        driverIcon: 'bg-sky-800 border-sky-500',
        classHeader: 'bg-sky-500 border-sky-500',
        fill: 'fill-sky-500',
        canvasFill: '#0ea5e9',
      });
    });
  });
});
