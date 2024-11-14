import { Meta, StoryObj } from '@storybook/react';
import { InputGear } from './InputGear';

export default {
  component: InputGear,
  argTypes: {
    gear: {
      control: {
        type: 'range',
        min: -1,
        max: 8,
        step: 1,
      },
    },
    speedMs: {
      control: {
        type: 'range',
        min: 0,
        max: 350,
        step: 1,
      },
    },
  },
} as Meta;

type Story = StoryObj<typeof InputGear>;

export const Primary: Story = {
  args: {
    gear: 1,
    speedMs: 30,
  },
};
