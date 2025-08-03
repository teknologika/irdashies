import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/postcss';
import path from 'node:path';
import tsconfig from './tsconfig.json';

// allow for path aliases in tsconfig.json to be used in Vite
// will load the paths from tsconfig.json paths property and create an object with key value pairs
// See: https://github.com/vitejs/vite/issues/6828
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
  build: {
    rollupOptions: {
      input: {
        renderer: path.resolve(__dirname, 'src/renderer.ts'),
        widget: path.resolve(__dirname, 'src/widget.tsx'),
      },
      output: {
        manualChunks: (id) => {
          // For widget entry, extract vendor libraries to separate chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('d3')) {
              return 'vendor-d3';
            }
            if (id.includes('@phosphor-icons/react')) {
              return 'vendor-icons';
            }
            if (id.includes('zustand') || id.includes('use-sync-external-store')) {
              return 'vendor-utils';
            }
            // Other node_modules dependencies go to vendor-misc
            return 'vendor-misc';
          }
          // Application code stays in entry chunks
          return null;
        },
        chunkFileNames: (chunkInfo) => {
          // Vendor chunks get consistent names for better caching
          if (chunkInfo.name && chunkInfo.name.startsWith('vendor-')) {
            return 'assets/[name]-[hash].js';
          }
          // Other chunks use hash for cache busting
          return 'assets/[name]-[hash].js';
        },
        entryFileNames: (chunkInfo) => {
          // Widget entry should have consistent name for HTTP server
          if (chunkInfo.name === 'widget') {
            return 'widget.js';
          }
          // Other entries use hash for cache busting
          return 'assets/[name]-[hash].js';
        },
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    sourcemap: false,
  },
});
