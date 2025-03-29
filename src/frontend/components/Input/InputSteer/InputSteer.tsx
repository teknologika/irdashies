import { SteeringWheel } from '@phosphor-icons/react';

export type InputSteerProps = object; // TODO

export const InputSteer = () => {
  return (
    <div className="w-[120px]">
      <SteeringWheel width="100%" height="100%" />
    </div>
  );
};
