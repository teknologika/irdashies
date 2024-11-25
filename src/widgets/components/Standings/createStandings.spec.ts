import { describe, it, expect } from 'vitest';
import { createStandings, sliceRelevantDrivers } from './createStandings';
import type {
  SessionData,
  SessionInfo,
  TelemetryVarList,
} from '@irsdk-node/types';

describe('createStandings', () => {
  const mockSessionData: SessionData = {
    DriverInfo: {
      DriverCarIdx: 1,
      Drivers: [
        {
          CarIdx: 0,
          UserName: 'Driver 1',
          CarNumber: '1',
          CarClassID: 1,
          CarClassShortName: 'Class 1',
          CarClassRelSpeed: 1.0,
        },
        {
          CarIdx: 1,
          UserName: 'Driver 2',
          CarNumber: '2',
          CarClassID: 2,
          CarClassShortName: 'Class 2',
          CarClassRelSpeed: 0.9,
        },
      ],
    },
    SessionInfo: {
      Sessions: [
        {
          SessionType: 'Race',
          ResultsPositions: [
            {
              CarIdx: 0,
              ClassPosition: 0,
              FastestTime: 100,
              LastTime: 105,
            },
            {
              CarIdx: 1,
              ClassPosition: 1,
              FastestTime: 110,
              LastTime: 115,
            },
          ],
          ResultsFastestLap: [
            {
              CarIdx: 0,
              FastestTime: 100,
            },
          ],
        },
      ],
    },
  } as SessionData;

  const mockTelemetry: TelemetryVarList = {
    CarIdxF2Time: {
      value: [0, 10],
    },
  } as TelemetryVarList;

  const mockCurrentSession: SessionInfo =
    mockSessionData.SessionInfo.Sessions[0];

  it('should create standings with correct data', () => {
    const standings = createStandings(
      mockSessionData,
      mockTelemetry,
      mockCurrentSession
    );
    expect(standings).toHaveLength(2);
    expect(standings[0][1][0].driver.name).toBe('Driver 1');
    expect(standings[0][1][0].delta).toBe(0);
    expect(standings[1][1][0].driver.name).toBe('Driver 2');
    expect(standings[1][1][0].delta).toBe(10);
  });

  it('should group standings by class', () => {
    const standings = createStandings(
      mockSessionData,
      mockTelemetry,
      mockCurrentSession
    );
    expect(standings).toHaveLength(2);
    expect(standings[0][0]).toBe('1');
    expect(standings[1][0]).toBe('2');
  });

  it('should slice relevant drivers correctly', () => {
    const standings = createStandings(
      mockSessionData,
      mockTelemetry,
      mockCurrentSession
    );
    expect(standings[0][1]).toHaveLength(1);
    expect(standings[1][1]).toHaveLength(1);
  });

  describe('sliceRelevantDrivers', () => {
    type DummyStanding = { name: string; isPlayer?: boolean };
    it('should return only top 3 drivers for class without player', () => {
      const results: [string, DummyStanding[]][] = [
        [
          'GT3',
          [
            { name: 'Bob' },
            { name: 'Alice' },
            { name: 'Charlie' },
            { name: 'David' },
            { name: 'Eve' },
          ],
        ],
        [
          'GT4',
          [
            { name: 'Clark' },
            { name: 'Richard' },
            { name: 'Sam' },
            { name: 'Bingo' },
            { name: 'Tod', isPlayer: true },
          ],
        ],
      ];

      const filteredDrivers = sliceRelevantDrivers(results);

      expect(filteredDrivers).toEqual([
        ['GT3', [{ name: 'Bob' }, { name: 'Alice' }, { name: 'Charlie' }]],
        [
          'GT4',
          [
            { name: 'Clark' },
            { name: 'Richard' },
            { name: 'Sam' },
            { name: 'Bingo' },
            { name: 'Tod', isPlayer: true },
          ],
        ],
      ]);
    });

    it('should return all drivers when less than 3 available for class without player', () => {
      const results: [string, DummyStanding[]][] = [
        ['GT3', [{ name: 'Bob' }, { name: 'Alice' }]],
      ];

      const filteredDrivers = sliceRelevantDrivers(results);

      expect(filteredDrivers).toEqual([
        ['GT3', [{ name: 'Bob' }, { name: 'Alice' }]],
      ]);
    });

    it('should return top 3 and drivers around player', () => {
      const results: [string, DummyStanding[]][] = [
        [
          'GT3',
          [
            { name: 'Bob' },
            { name: 'Alice' },
            { name: 'Charlie' },
            { name: 'David' },
            { name: 'Sebastian' },
            { name: 'Nico' },
            { name: 'Eve' },
            { name: 'Frank' },
            { name: 'Max' },
            { name: 'George' },
            { name: 'Player', isPlayer: true },
            { name: 'Hannah' },
          ],
        ],
      ];

      const filteredDrivers = sliceRelevantDrivers(results);

      expect(filteredDrivers).toEqual([
        [
          'GT3',
          [
            { name: 'Bob' },
            { name: 'Alice' },
            { name: 'Charlie' },
            { name: 'Frank' },
            { name: 'Max' },
            { name: 'George' },
            { name: 'Player', isPlayer: true },
            { name: 'Hannah' },
          ],
        ],
      ]);
    });

    it('should return more drivers at the end when player is top 3', () => {
      const results: [string, DummyStanding[]][] = [
        [
          'GT3',
          [
            { name: 'Bob' },
            { name: 'Player', isPlayer: true },
            { name: 'Alice' },
            { name: 'Charlie' },
            { name: 'David' },
            { name: 'Sebastian' },
            { name: 'Nico' },
            { name: 'Eve' },
            { name: 'Frank' },
            { name: 'Max' },
            { name: 'George' },
            { name: 'Hannah' },
          ],
        ],
      ];

      const filteredDrivers = sliceRelevantDrivers(results);

      expect(filteredDrivers).toEqual([
        [
          'GT3',
          [
            { name: 'Bob' },
            { name: 'Player', isPlayer: true },
            { name: 'Alice' },
            { name: 'Charlie' },
            { name: 'David' },
            { name: 'Sebastian' },
            { name: 'Nico' },
          ],
        ],
      ]);
    });
  });
});
