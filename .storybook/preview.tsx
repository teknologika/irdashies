import type { Preview } from "@storybook/react";
import '../src/theme.css';
import React from "react";
import { TelemetryProvider } from "../src/widgets/TelemetryContext/TelemetryContext";
import { generateMockData } from '../src/bridge/iracingSdk/mock-data/generateMockData';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story) => {
      return (
        <TelemetryProvider bridge={generateMockData()}>
          <Story />
        </TelemetryProvider>
      );
    }
  ],
};

export default preview;
