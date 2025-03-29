import { Decorator } from '@storybook/react';
import { SessionProvider, TelemetryProvider } from '@irdashies/context';
import { generateMockDataFromPath } from '../src/app/bridge/iracingSdk/mock-data/generateMockData';

// eslint-disable-next-line react/display-name
export const TelemetryDecorator: (path?: string) => Decorator = (path) => (Story) => (
  <>
    <SessionProvider bridge={generateMockDataFromPath(path)} />
    <TelemetryProvider bridge={generateMockDataFromPath(path)} />
    <Story />
  </>
);
