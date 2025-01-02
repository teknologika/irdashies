import { Meta, StoryObj } from '@storybook/react';
import { Relative } from './Relative';
import { TelemetryDecorator } from '../../../../.storybook/telemetryDecorator';

export default {
  component: Relative,
} as Meta;

type Story = StoryObj<typeof Relative>;

export const Primary: Story = {
  decorators: [TelemetryDecorator()],
};

export const MultiClassPCCWithClio: Story = {
  decorators: [TelemetryDecorator('/test-data/1731637331038')],
};

export const SupercarsRace: Story = {
  decorators: [TelemetryDecorator('/test-data/1732274253573')],
};

export const AdvancedMX5: Story = {
  decorators: [TelemetryDecorator('/test-data/1732260478001')],
};

export const GT3Practice: Story = {
  decorators: [TelemetryDecorator('/test-data/1732355190142')],
};

export const PCCPacing: Story = {
  decorators: [TelemetryDecorator('/test-data/1735296198162')],
};
