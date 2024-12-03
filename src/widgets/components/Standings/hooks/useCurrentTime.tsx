import { useEffect, useState } from 'react';

export const useCurrentTime = () => {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString([], options)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      // only hour / minutes
      setTime(new Date().toLocaleTimeString([], options));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return time;
};
