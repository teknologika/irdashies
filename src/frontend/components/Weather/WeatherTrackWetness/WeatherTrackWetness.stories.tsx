import type { Meta, StoryObj } from '@storybook/react';
import { WeatherTrackWetness } from './WeatherTrackWetness';

export default {
  component: WeatherTrackWetness,
} as Meta;

type Story = StoryObj<typeof WeatherTrackWetness>;

export const Primary: Story = {
  args: {
    trackMoisture: 5,
  },
};
