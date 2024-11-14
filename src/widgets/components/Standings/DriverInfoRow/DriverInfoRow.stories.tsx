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
    classIdx: 0,
    fastestTime: 111.111,
    lastTime: 112.225,
    badge: <DriverRatingBadge license="A 4.99" rating={4999} />,
  },
};
