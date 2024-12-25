import type { Preview } from '@storybook/react';
import '../src/frontend/theme.css';
import { TelemetryDecorator } from './telemetryDecorator';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [TelemetryDecorator()],
};

export default preview;
