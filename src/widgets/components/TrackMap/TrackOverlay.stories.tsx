import { Meta, StoryObj } from '@storybook/react';
import { TrackOverlay } from './TrackOverlay';
import { TelemetryDecorator } from '../../../../.storybook/telemetryDecorator';

export default {
  component: TrackOverlay,
} as Meta;

type Story = StoryObj<typeof TrackOverlay>;

export const Primary: Story = {
  render: () => {
    return <TrackOverlay />;
  },
};

export const MultiClassPCCWithClio: Story = {
  decorators: [TelemetryDecorator('/test-data/1731637331038')],
};
