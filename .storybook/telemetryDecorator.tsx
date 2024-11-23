import React from 'react';
import { generateMockData, generateMockDataFromPath } from '../src/bridge/iracingSdk/mock-data/generateMockData';
import { TelemetryProvider } from '../src/widgets/context/TelemetryContext/TelemetryContext';

export const TelemetryDecorator = (path?: string) => (Story) => {
  return (
    <TelemetryProvider bridge={generateMockDataFromPath(path)}>
      <Story />
    </TelemetryProvider>
  );
};
