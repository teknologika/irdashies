import { Meta, StoryObj } from '@storybook/react';
import { Standings } from './Standings';

export default {
  component: Standings,
} as Meta;

type Story = StoryObj<typeof Standings>;

export const Primary: Story = {
  args: {},
};
