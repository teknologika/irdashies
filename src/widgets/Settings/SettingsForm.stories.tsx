import { Meta, StoryObj } from '@storybook/react';
import { SettingsForm } from './SettingsForm';

export default {
  component: SettingsForm,
} as Meta;

type Story = StoryObj<typeof SettingsForm>;

export const Primary: Story = {
  args: {},
};
