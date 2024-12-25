import { defineConfig } from 'vite';
import tailwindcss from 'tailwindcss';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [tsconfigPaths()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
