import { defineConfig } from 'vite';
import tailwindcss from 'tailwindcss';
import path from 'node:path';

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      '@irdashies/context': path.resolve(__dirname, './src/frontend/context'),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
