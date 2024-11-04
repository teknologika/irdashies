import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['irsdk-node'], // allows irsdk-node to import .node files
    },
  },
});
