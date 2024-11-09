import { Meta, StoryObj } from '@storybook/react';
import { DriverRatingBadge } from './DriverRatingBadge';

export default {
  component: DriverRatingBadge,
} as Meta;

type Story = StoryObj<typeof DriverRatingBadge>;

export const Primary: Story = {
  args: {
    licenseString: 'A 4.99',
    rating: 4999,
  },
};

export const AllRatings: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <DriverRatingBadge licenseString="A 4.99" rating={4999} />
      <DriverRatingBadge licenseString="B 3.99" rating={3999} />
      <DriverRatingBadge licenseString="C 2.99" rating={2999} />
      <DriverRatingBadge licenseString="D 1.99" rating={1999} />
      <DriverRatingBadge licenseString="R 0.99" rating={999} />
    </div>
  ),
};
