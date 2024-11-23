import { Meta, StoryObj } from '@storybook/react';
import { DriverInfoRow } from './DriverInfoRow';
import { DriverRatingBadge } from '../DriverRatingBadge/DriverRatingBadge';

export default {
  component: DriverInfoRow,
} as Meta;

type Story = StoryObj<typeof DriverInfoRow>;

export const Primary: Story = {
  args: {
    carIdx: 1,
    carNumber: '999',
    name: 'John Doe',
    isPlayer: false,
    delta: 0.1,
    position: 1,
    classColor: 16777215,
    fastestTime: 111.111,
    lastTime: 112.225,
    badge: <DriverRatingBadge license="A 4.99" rating={4999} />,
  },
};

export const HasFastestLap: Story = {
  args: {
    carIdx: 1,
    carNumber: '999',
    name: 'John Doe',
    isPlayer: false,
    delta: 0.1,
    position: 1,
    hasFastestTime: true,
    classColor: 16777215,
    fastestTime: 111.111,
    lastTime: 112.225,
    badge: <DriverRatingBadge license="A 4.99" rating={4999} />,
  },
};

export const LastLapIsFastestLap: Story = {
  args: {
    carIdx: 1,
    carNumber: '999',
    name: 'John Doe',
    isPlayer: false,
    delta: 0.1,
    position: 1,
    hasFastestTime: true,
    classColor: 16777215,
    fastestTime: 111.111,
    lastTime: 111.111,
    badge: <DriverRatingBadge license="A 4.99" rating={4999} />,
  },
};

export const LastLapIsBestTime: Story = {
  args: {
    carIdx: 1,
    carNumber: '999',
    name: 'John Doe',
    isPlayer: false,
    delta: 0.1,
    position: 1,
    hasFastestTime: false,
    classColor: 16777215,
    fastestTime: 111.111,
    lastTime: 111.111,
    badge: <DriverRatingBadge license="A 4.99" rating={4999} />,
  },
};
