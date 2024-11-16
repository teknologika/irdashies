import { Meta, StoryObj } from '@storybook/react';
import { Standings } from './Standings';
import {
  generateMockData,
  generateMockDataFromPath,
} from '../../../bridge/iracingSdk/mock-data/generateMockData';
import { TelemetryProvider } from '../../context/TelemetryContext/TelemetryContext';

export default {
  component: Standings,
} as Meta;

type Story = StoryObj<typeof Standings>;

export const Primary: Story = {
  decorators: [
    (Story) => (
      <TelemetryProvider bridge={generateMockData()}>
        <Story />
      </TelemetryProvider>
    ),
  ],
  args: {},
};

export const MultiClassPCC: Story = {
  decorators: [
    (Story) => (
      <TelemetryProvider
        bridge={generateMockDataFromPath('../../../../test-data/1731391056221')}
      >
        <Story />
      </TelemetryProvider>
    ),
  ],
  args: {},
};

export const MultiClassPCCWithClio: Story = {
  decorators: [
    (Story) => (
      <TelemetryProvider
        bridge={generateMockDataFromPath('../../../../test-data/1731637331038')}
      >
        <Story />
      </TelemetryProvider>
    ),
  ],
  args: {},
};
