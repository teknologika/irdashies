import { StoryFn } from '@storybook/react';
import { generateMockDataFromPath } from '../src/bridge/iracingSdk/mock-data/generateMockData';
import { TelemetryProvider } from '@irdashies/context';

export const TelemetryDecorator = (path?: string) => (Story: StoryFn) => {
  return (
    <TelemetryProvider bridge={generateMockDataFromPath(path)}>
      <Story />
    </TelemetryProvider>
  );
};
