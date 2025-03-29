import { StoryFn } from '@storybook/react';
import { generateMockDataFromPath } from '../src/app/bridge/iracingSdk/mock-data/generateMockData';
import { SessionProvider, TelemetryProvider } from '@irdashies/context';

// eslint-disable-next-line react/display-name
export const TelemetryDecorator = (path?: string) => (Story: StoryFn) => (
  <>
    <SessionProvider bridge={generateMockDataFromPath(path)} />
    <TelemetryProvider bridge={generateMockDataFromPath(path)} />
    <Story />
  </>
);
