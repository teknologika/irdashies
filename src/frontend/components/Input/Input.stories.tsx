import { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  component: Input,
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Primary: Story = {
  render: () => (
    <>
      <div className="h-[80px] w-[400px]">
        <Input />
      </div>
    </>
  ),
  args: {},
};

export const Bigger: Story = {
  render: () => (
    <div className="h-full w-full">
      <Input />
    </div>
  ),
  args: {},
};
