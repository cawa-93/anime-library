/* eslint-env node */

import {chrome} from '../../electron-vendors.config.json';
import {join} from 'path';
import {builtinModules} from 'module';
import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {loadAndSetEnv} from '../../scripts/loadAndSetEnv.mjs';
import copy from 'rollup-plugin-copy';
import {VitePWA} from 'vite-plugin-pwa';

const PACKAGE_ROOT = __dirname;

/**
 * Vite looks for `.env.[mode]` files only in `PACKAGE_ROOT` directory.
 * Therefore, you must manually load and set the environment variables from the root directory above
 */
loadAndSetEnv(process.env.MODE, process.cwd());

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  root: PACKAGE_ROOT,
  logLevel: 'warn',
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
      '/@shared/': join(PACKAGE_ROOT, '../shared') + '/',
    },
  },
  server: {
    fsServe: {
      root: join(PACKAGE_ROOT, '../../'),
    },
  },
  optimizeDeps: {
    exclude: [
      'libass-wasm',
      'libass-wasm/dist/js/subtitles-octopus-worker.js',
      'libass-wasm/dist/js/subtitles-octopus-worker.js?url',
    ],
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    terserOptions: {
      ecma: 2020,
      compress: {
        passes: 2,
      },
      safari10: false,
    },
    rollupOptions: {
      external: [
        ...builtinModules,
      ],
    },
    emptyOutDir: true,
  },
  plugins: [
    vue(),
    copy({
      hook: 'writeBundle',
      targets: [{
        src: [
          'packages/renderer/src/components/WatchPage/VideoPlayer/libass-wasm/subtitles-octopus-worker.data',
          'packages/renderer/src/components/WatchPage/VideoPlayer/libass-wasm/subtitles-octopus-worker.wasm',
        ],
        dest: 'packages/renderer/dist',
      }],
    }),
    VitePWA({
      mode: 'development',
      injectRegister: 'script',
      manifest: false,
      workbox: {
        globPatterns: [],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/smotret-anime\.online\/api\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sm-api-calls',
              expiration: {
                maxAgeSeconds: 60 * 60,
              },
            },
          },
        ],
      },
    }),
  ],
});

