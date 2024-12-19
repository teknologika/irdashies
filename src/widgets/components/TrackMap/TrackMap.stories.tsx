import { Meta, StoryObj } from '@storybook/react';
import { TrackMap } from './TrackMap';
import { useEffect, useState } from 'react';

export default {
  component: TrackMap,
  argTypes: {
    trackId: {
      control: { type: 'number' },
    },
  },
} as Meta;

type Story = StoryObj<typeof TrackMap>;

export const Primary: Story = {
  args: {
    trackId: 1,
    driver: {
      progress: 0,
      carIdx: 1,
    },
  },
};

export const AllTracks: Story = {
  render: (args) => {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 531 }).map((_, i) => {
          return (
            <div key={i}>
              <div className="my-2">Track ID: {i + 1}</div>
              <TrackMap trackId={i + 1} driver={args.driver} />
            </div>
          );
        })}
      </div>
    );
  },
  args: {
    driver: {
      progress: 0,
      carIdx: 1,
    },
  },
};

export const CirclingAround: Story = {
  render: (args) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => (prev + 0.5) % 100);
      }, 20);

      return () => clearInterval(interval);
    });

    return (
      <TrackMap trackId={args.trackId} driver={{ ...args.driver, progress }} />
    );
  },
  args: {
    trackId: 1,
    driver: {
      progress: 0,
      carIdx: 1,
    },
  },
};
