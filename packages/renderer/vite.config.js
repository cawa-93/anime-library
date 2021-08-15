/* eslint-env node */

import {chrome} from '../../electron-vendors.config.json';
import {join} from 'path';
import {builtinModules} from 'module';
import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import copy from 'rollup-plugin-copy';
import {VitePWA} from 'vite-plugin-pwa';

const PACKAGE_ROOT = __dirname;


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
  envDir: process.cwd(),
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
  css: {
    preprocessorOptions: {
      sass: {
        quietDeps: true,
      },
    },
  },
  plugins: [
    vue(),

    VitePWA({
      strategies: 'generateSW',
      mode: 'development',
      injectRegister: 'script',
      manifest: false,
      debug: true,
      workbox: {
        globPatterns: [],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/smotret-anime\.online\/api\/series.*episodes/,
            handler: 'CacheFirst',
            options: {
              plugins: [waitOnlinePlugin],
              cacheName: 'sm-episodes',
              expiration: {
                maxAgeSeconds: 24 * 60 * 60,
              },
            },
          },

          {
            urlPattern: /^https:\/\/smotret-anime\.online\/api\/series.*/,
            handler: 'CacheFirst',
            options: {
              plugins: [waitOnlinePlugin],
              cacheName: 'sm-series',
              expiration: {
                maxEntries: 1000,
              },
            },
          },

          {
            urlPattern: /^https:\/\/smotret-anime\.online\/api\/translations\/embed\/.*access_token/,
            handler: 'CacheFirst',
            options: {
              plugins: [waitOnlinePlugin],
              cacheName: 'sm-embeds',
              expiration: {
                maxAgeSeconds: 24 * 60 * 60,
              },
            },
          },

          {
            urlPattern: /^https:\/\/smotret-anime\.online\/api\/.*/,
            handler: 'CacheFirst',
            options: {
              plugins: [waitOnlinePlugin],
              cacheName: 'sm-api-calls',
              expiration: {
                maxAgeSeconds: 12 * 60 * 60, // 12 часов
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
