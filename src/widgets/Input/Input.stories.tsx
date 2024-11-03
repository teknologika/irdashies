import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { useEffect, useState } from 'react';

const meta: Meta<typeof Input> = {
  component: Input,
};
export default meta;

type Story = StoryObj<typeof Input>;

const RandomTraces = () => {
  const [throttle, setThrottle] = useState(0);
  const [brake, setBrake] = useState(0);
  const [clutch, setClutch] = useState(0);
  const [gear] = useState(2);
  const [speed] = useState(122);

  useEffect(() => {
    const interval = setInterval(() => {
      setThrottle((value) =>
        Math.max(0, Math.min(1, value + Math.random() * 0.1 - 0.05)),
      );

      setBrake((value) =>
        Math.max(0, Math.min(1, value + Math.random() * 0.1 - 0.05)),
      );

      setClutch((value) =>
        Math.max(0, Math.min(1, value + Math.random() * 0.1 - 0.05)),
      );
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, []);
  return (
    <Input
      brake={brake}
      throttle={throttle}
      clutch={clutch}
      gear={gear}
      speed={speed}
    />
  );
};

export const Primary: Story = {
  render: () => <RandomTraces />,
  args: {},
};
