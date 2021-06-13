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

const waitOnlinePlugin = {
  requestWillFetch: ({request}) => {
    if (navigator.onLine) {
      return Promise.resolve(request);
    }

    return new Promise(r => {
      const c = setInterval(() => {
        if (navigator.onLine) {
          clearInterval(c);
          r(request);
        }
      }, 2000);
    });
  },
};

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  mode: process.env.MODE,
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

    VitePWA({
      mode: 'production',
      injectRegister: 'script',
      manifest: false,
      workbox: {
        globPatterns: [],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/smotret-anime\.online\/api\/.*/,
            handler: 'CacheFirst',
            options: {
              plugins: [waitOnlinePlugin],
              cacheName: 'sm-api-calls',
              expiration: {
                maxAgeSeconds: 60 * 60,
              },
            },
          },

          {
            urlPattern: /^https:\/\/sub\.smotret-anime\.online\/.*/,
            handler: 'CacheFirst',
            options: {
              plugins: [waitOnlinePlugin],
              cacheName: 'sm-subtitles',
              expiration: {
                maxEntries: 10,
              },
            },
          },


          // {
          //   urlPattern: /^https:\/\/shikimori\.one\/api\/animes\?.*/,
          //   handler: 'CacheFirst',
          //   options: {
          //     plugins: [waitOnlinePlugin],
          //     cacheName: 'shikimori-search-results',
          //     expiration: {
          //       maxAgeSeconds: 60 * 60 * 12,
          //     },
          //   },
          // },


        ],
      },
    }),

    copy({
      verbose: true,
      hook: 'writeBundle',
      targets: [{
        src: [
          './src/components/WatchPage/VideoPlayer/libass-wasm/subtitles-octopus-worker.data',
          './src/components/WatchPage/VideoPlayer/libass-wasm/subtitles-octopus-worker.wasm',
        ],
        dest: './dist',
      }],
    }),
  ],
});
