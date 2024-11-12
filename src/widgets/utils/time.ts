export const formatTime = (seconds?: number): string => {
  if (!seconds) return '';

  const ms = Math.floor((seconds % 1) * 1000); // Get milliseconds
  const totalSeconds = Math.floor(seconds); // Get total whole seconds
  const minutes = Math.floor(totalSeconds / 60); // Get minutes
  const remainingSeconds = totalSeconds % 60; // Get remaining seconds

  // Format as mm:ss:ms
  const formattedTime = `${minutes}:${String(remainingSeconds).padStart(2, '0')}:${String(ms).padStart(3, '0')}`;

  return formattedTime;
};
