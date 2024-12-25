import { StoryFn } from '@storybook/react';
import { generateMockDataFromPath } from '../src/bridge/iracingSdk/mock-data/generateMockData';
import { TelemetryProvider } from '../src/frontend/context/TelemetryContext/TelemetryContext';

export const TelemetryDecorator = (path?: string) => (Story: StoryFn) => {
  return (
    <TelemetryProvider bridge={generateMockDataFromPath(path)}>
      <Story />
    </TelemetryProvider>
  );
};
