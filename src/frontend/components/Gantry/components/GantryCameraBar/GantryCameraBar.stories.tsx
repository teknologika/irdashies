import type { Meta, StoryObj } from '@storybook/react-vite';
import { GantryCameraBar, type CameraFollowMode } from './GantryCameraBar';
import type { CameraGroup } from '@irdashies/types';

const drivers = [
  { carIdx: 1, carNumber: '33', name: 'Max Verstappen' },
  { carIdx: 2, carNumber: '44', name: 'Lewis Hamilton' },
  { carIdx: 3, carNumber: '11', name: 'Sergio Perez' },
  { carIdx: 4, carNumber: '16', name: 'Charles Leclerc' },
  { carIdx: 5, carNumber: '55', name: 'Carlos Sainz' },
  { carIdx: 6, carNumber: '14', name: 'Fernando Alonso' },
];

const cameraGroups: CameraGroup[] = [
  {
    GroupNum: 1,
    GroupName: 'Nose',
    Cameras: [{ CameraNum: 0, CameraName: 'CamNose' }],
  },
  {
    GroupNum: 2,
    GroupName: 'Gearbox',
    Cameras: [{ CameraNum: 0, CameraName: 'CamGearbox' }],
  },
  {
    GroupNum: 3,
    GroupName: 'Roll Bar',
    Cameras: [{ CameraNum: 0, CameraName: 'CamRollBar' }],
  },
  {
    GroupNum: 4,
    GroupName: 'TV Dynamic',
    Cameras: [{ CameraNum: 0, CameraName: 'CamTVDynamic' }],
  },
  {
    GroupNum: 5,
    GroupName: 'TV Static',
    Cameras: [{ CameraNum: 0, CameraName: 'CamTVStatic' }],
  },
  {
    GroupNum: 6,
    GroupName: 'TV3 Far Chase',
    Cameras: [{ CameraNum: 0, CameraName: 'CamTV3' }],
  },
  {
    GroupNum: 7,
    GroupName: 'Blimp',
    Cameras: [{ CameraNum: 0, CameraName: 'CamBlimp' }],
  },
  {
    GroupNum: 8,
    GroupName: 'Scenic',
    Cameras: [{ CameraNum: 0, CameraName: 'CamScenic' }],
  },
];

const meta: Meta<typeof GantryCameraBar> = {
  component: GantryCameraBar,
  title: 'widgets/Gantry/components/GantryCameraBar',
  parameters: { layout: 'fullscreen' },
  argTypes: {
    onSwitchCamera: { action: 'switch-camera' },
    onSetStateFlags: { action: 'set-state-flags' },
    onStageChange: { action: 'stage-change' },
    onFollowModeChange: { action: 'follow-mode-change' },
  },
  decorators: [
    (Story) => (
      <div className="w-[900px] bg-slate-900 text-white">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof GantryCameraBar>;

export const Default: Story = {
  args: {
    drivers,
    cameraGroups,
    activeCamGroupNumber: 4,
    activeCamCarIdx: 1,
    activeCamState: 0,
    stagedCarIdx: null,
    followMode: 'driver' as CameraFollowMode,
  },
};

export const StagedDriver: Story = {
  args: {
    drivers,
    cameraGroups,
    activeCamGroupNumber: 4,
    activeCamCarIdx: 1,
    activeCamState: 0,
    stagedCarIdx: 2,
    followMode: 'driver' as CameraFollowMode,
  },
};

export const LeaderMode: Story = {
  args: {
    drivers,
    cameraGroups,
    activeCamGroupNumber: 6,
    activeCamCarIdx: 3,
    activeCamState: 0,
    stagedCarIdx: null,
    followMode: 'leader' as CameraFollowMode,
  },
};

export const UIHidden: Story = {
  args: {
    drivers,
    cameraGroups,
    activeCamGroupNumber: 1,
    activeCamCarIdx: 0,
    activeCamState: 0x0008,
    stagedCarIdx: null,
    followMode: 'driver' as CameraFollowMode,
  },
};

export const NoCameraGroups: Story = {
  args: {
    drivers,
    cameraGroups: undefined,
    activeCamGroupNumber: 0,
    activeCamCarIdx: 0,
    activeCamState: 0,
    stagedCarIdx: null,
    followMode: 'driver' as CameraFollowMode,
  },
};
