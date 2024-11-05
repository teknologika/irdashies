import type { Meta, StoryObj } from '@storybook/react';
import { InputTrace } from './InputTrace';
import { useEffect, useState } from 'react';

const meta: Meta<typeof InputTrace> = {
  component: InputTrace,
  argTypes: {
    brake: {
      control: {
        type: 'range',
        min: -2,
        max: 2,
        step: 0.01,
      },
    },
    throttle: {
      control: {
        type: 'range',
        min: -2,
        max: 2,
        step: 0.01,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof InputTrace>;

const Traces = () => {
  const [throttle, setThrottle] = useState(0);
  const [brake, setBrake] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setThrottle((value) =>
        Math.max(0, Math.min(1, value + Math.random() * 0.1 - 0.05)),
      );

      setBrake((value) =>
        Math.max(0, Math.min(1, value + Math.random() * 0.1 - 0.05)),
      );
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, []);
  return <InputTrace brake={brake} throttle={throttle} />;
};

export const Primary: Story = {
  render: () => <Traces />,
  args: {},
};

export const OutsideRange: Story = {
  args: {
    throttle: -0.5,
    brake: 1.5,
  },
};
