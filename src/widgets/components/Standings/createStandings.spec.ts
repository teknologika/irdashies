import { describe, it, expect } from 'vitest';
import { createStandings, sliceRelevantDrivers } from './createStandings';
import type {
  SessionData,
  SessionInfo,
  TelemetryVariable,
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

  it('should show as on pit road when CarIdx is in PitRoadLane', () => {
    const mockTelemetryWithPitRoad: TelemetryVarList = {
      ...mockTelemetry,
      CarIdxOnPitRoad: {
        value: [true],
      } as TelemetryVariable<boolean[]>,
    };

    const standings = createStandings(
      mockSessionData,
      mockTelemetryWithPitRoad,
      mockCurrentSession
    );

    expect(standings[0][1][0].onPitRoad).toBe(true);
  });

  it('should not show as on pit road when not in CarIdxOnPitRoad', () => {
    const mockTelemetryWithPitRoad: TelemetryVarList = {
      ...mockTelemetry,
      CarIdxOnPitRoad: {
        value: [false],
      } as TelemetryVariable<boolean[]>,
    };

    const standings = createStandings(
      mockSessionData,
      mockTelemetryWithPitRoad,
      mockCurrentSession
    );

    expect(standings[0][1][0].onPitRoad).toBe(false);
  });

  it('should show as onTrack when CarIdxTrackSurface is positive', () => {
    const mockTelemetryWithConnected: TelemetryVarList = {
      ...mockTelemetry,
      CarIdxTrackSurface: {
        value: [1],
      } as TelemetryVariable<number[]>,
    };

    const standings = createStandings(
      mockSessionData,
      mockTelemetryWithConnected,
      mockCurrentSession
    );

    expect(standings[0][1][0].onTrack).toBe(true);
  });

  describe('sliceRelevantDrivers', () => {
    type DummyStanding = { name: string; isPlayer?: boolean };
    it('should return only top 3 drivers for class without player', () => {
      const results: [string, DummyStanding[]][] = [
        [
          'GT3',
          [
            { name: '1. Bob' },
            { name: '2. Alice' },
            { name: '3. Charlie' },
            { name: '4. David' },
            { name: '5. Eve' },
          ],
        ],
        [
          'GT4',
          [
            { name: '1. Clark' },
            { name: '2. Richard' },
            { name: '3. Sam' },
            { name: '4. Bingo' },
            { name: '5. Tod', isPlayer: true },
          ],
        ],
      ];

      const filteredDrivers = sliceRelevantDrivers(results);

      expect(filteredDrivers).toEqual([
        [
          'GT3',
          [{ name: '1. Bob' }, { name: '2. Alice' }, { name: '3. Charlie' }],
        ],
        [
          'GT4',
          [
            { name: '1. Clark' },
            { name: '2. Richard' },
            { name: '3. Sam' },
            { name: '4. Bingo' },
            { name: '5. Tod', isPlayer: true },
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
            { name: '1. Bob' },
            { name: '2. Alice' },
            { name: '3. Charlie' },
            { name: '4. David' },
            { name: '5. Sebastian' },
            { name: '6. Nico' },
            { name: '7. Eve' },
            { name: '8. Frank' },
            { name: '9. Max' },
            { name: '10. George' },
            { name: '11. Player', isPlayer: true },
            { name: '12. Hannah' },
          ],
        ],
      ];

      const filteredDrivers = sliceRelevantDrivers(results);

      expect(filteredDrivers).toEqual([
        [
          'GT3',
          [
            { name: '1. Bob' },
            { name: '2. Alice' },
            { name: '3. Charlie' },
            { name: '8. Frank' },
            { name: '9. Max' },
            { name: '10. George' },
            { name: '11. Player', isPlayer: true },
            { name: '12. Hannah' },
          ],
        ],
      ]);
    });

    it('should return more drivers at the end when player is top 3', () => {
      const results: [string, DummyStanding[]][] = [
        [
          'GT3',
          [
            { name: '1. Bob' },
            { name: '2. Player', isPlayer: true },
            { name: '3. Alice' },
            { name: '4. Charlie' },
            { name: '5. David' },
            { name: '6. Sebastian' },
            { name: '7. Nico' },
            { name: '8. Eve' },
            { name: '9. Frank' },
            { name: '10. Max' },
            { name: '11. George' },
            { name: '12. Hannah' },
          ],
        ],
      ];

      const filteredDrivers = sliceRelevantDrivers(results);

      expect(filteredDrivers).toEqual([
        [
          'GT3',
          [
            { name: '1. Bob' },
            { name: '2. Player', isPlayer: true },
            { name: '3. Alice' },
            { name: '4. Charlie' },
            { name: '5. David' },
            { name: '6. Sebastian' },
            { name: '7. Nico' },
          ],
        ],
      ]);
    });
  });
});
