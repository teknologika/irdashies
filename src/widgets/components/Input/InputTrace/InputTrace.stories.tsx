import type { Meta, StoryObj } from '@storybook/react';
import { InputTrace } from './InputTrace';
import { useEffect, useState } from 'react';

const meta: Meta<typeof InputTrace> = {
  component: InputTrace,
};
export default meta;

type Story = StoryObj<typeof InputTrace>;

const Traces = () => {
  const [throttle, setThrottle] = useState(0);
  const [brake, setBrake] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setThrottle((value) =>
        Math.max(0, Math.min(1, value + Math.random() * 0.1 - 0.05))
      );

      setBrake((value) =>
        Math.max(0, Math.min(1, value + Math.random() * 0.1 - 0.05))
      );
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, []);
  return <InputTrace input={{ brake, throttle }} />;
};

export const Primary: Story = {
  render: () => <Traces />,
  args: {},
};

export const OutsideRange: Story = {
  render: (args) => {
    const [input, setInput] = useState({ brake: 2, throttle: -1 });
    useEffect(() => {
      const interval = setInterval(() => {
        setInput(() => ({
          brake: args.input.brake,
          throttle: args.input.throttle,
        }));
      }, 1000 / 60);

      return () => clearInterval(interval);
    }, []);

    return <InputTrace input={input} />;
  },
  args: {
    input: {
      brake: 2,
      throttle: -1,
    },
  },
};
