/* eslint-env node */

import {chrome} from '../../electron-vendors.config.json';
import {join} from 'path';
import {builtinModules} from 'module';
import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {loadAndSetEnv} from '../../scripts/loadAndSetEnv.mjs';
// import {generateSW} from 'rollup-plugin-workbox';
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
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    polyfillDynamicImport: false,
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

