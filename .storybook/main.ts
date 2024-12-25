import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from 'vite';
import rendererConfig from '../vite.renderer.config';

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal(config) {
    return mergeConfig(config, 
      rendererConfig
    )
  }
};
export default config;
