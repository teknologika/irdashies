import { Meta, StoryObj } from '@storybook/react';
import { DriverInfoRow } from './DriverInfoRow';
import { DriverRatingBadge } from '../DriverRatingBadge/DriverRatingBadge';

export default {
  component: DriverInfoRow,
} as Meta;

type Story = StoryObj<typeof DriverInfoRow>;

export const Primary: Story = {
  args: {
    carNumber: 1,
    name: 'John Doe',
    isPlayer: false,
    delta: 0.1,
    position: 1,
    badge: <DriverRatingBadge license="A 4.99" rating={4999} />,
  },
};
