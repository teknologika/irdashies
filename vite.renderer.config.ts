import { defineConfig } from 'vite';
import tailwindcss from 'tailwindcss';
import path from 'node:path';
import tsconfig from './tsconfig.json';

export const tsconfigPathAliases = Object.fromEntries(
  Object.entries(tsconfig.compilerOptions.paths).map(([key, values]) => {
    let value = values[0];
    if (key.endsWith('/*')) {
      key = key.slice(0, -2);
      value = value.slice(0, -2);
    }

    const nodeModulesPrefix = 'node_modules/';
    if (value.startsWith(nodeModulesPrefix)) {
      value = value.replace(nodeModulesPrefix, '');
    } else {
      value = path.join(__dirname, value);
    }

    return [key, value];
  })
);

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: tsconfigPathAliases,
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
