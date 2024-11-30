import { useMemo } from 'react';
import { useTelemetry } from '../../../context/TelemetryContext';

export const useCarClassStats = () => {
  const { session } = useTelemetry();
  const classStats = useMemo(() => {
    return session?.DriverInfo?.Drivers.reduce(
      (acc, driver) => {
        if (acc[driver.CarClassID]) {
          return {
            ...acc,
            [driver.CarClassID]: {
              ...acc[driver.CarClassID],
              total: acc[driver.CarClassID].total + 1,
            },
          };
        }

        return {
          ...acc,
          [driver.CarClassID]: {
            total: 1,
            color: driver.CarClassColor,
            shortName: driver.CarClassShortName,
          },
        };
      },
      {} as Record<string, { total: number; color: number; shortName: string }>
    );
  }, [session?.DriverInfo?.Drivers]);

  return classStats;
};
