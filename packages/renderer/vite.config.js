/* eslint-env node */

import {chrome} from '../../electron-vendors.config.json';
import {join} from 'path';
import {builtinModules} from 'module';
import vue from '@vitejs/plugin-vue';
import copy from 'rollup-plugin-copy';
import {VitePWA} from 'vite-plugin-pwa';
import {getAppVersion} from '../../getAppVersion.cjs';
import WindiCSS from 'vite-plugin-windicss';

const PACKAGE_ROOT = __dirname;

/**
 * Необходимо установить версиб приложения в переменной окружения,
 * иначе она не будет доступна в рантайме
 * @type {string}
 */
process.env.VITE_APP_VERSION = getAppVersion();


/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
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

  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      external: [
        ...builtinModules,
      ],
    },
    emptyOutDir: true,
  },
  plugins: [
    vue(),
    WindiCSS(),

    VitePWA({
      strategies: 'generateSW',
      mode: process.env.MODE,
      injectRegister: 'script',
      manifest: false,
      debug: false,
      workbox: {
        globPatterns: [],
        runtimeCaching: [

          /** Список серий */
          {
            urlPattern: /^https:\/\/smotret-anime\.online\/api\/series.*episodes/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sm-episodes',
              expiration: {
                maxAgeSeconds: 24 * 60 * 60,
              },
            },
          },

          /** Базовая информация про аниме */
          {
            urlPattern: /^https:\/\/smotret-anime\.online\/api\/series.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sm-series',
              expiration: {
                maxEntries: 1000,
              },
            },
          },

          /** embed данные видео */
          {
            urlPattern: /^https:\/\/smotret-anime\.online\/api\/translations\/embed\/.*access_token/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sm-embeds',
              expiration: {
                maxAgeSeconds: 24 * 60 * 60,
              },
            },
          },

          /** Любые другие обращения к API smotret-anime */
          {
            urlPattern: /^https:\/\/smotret-anime\.online\/api\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sm-api-calls',
              expiration: {
                maxAgeSeconds: 12 * 60 * 60, // 12 часов
              },
            },
          },

          /** Файлы субтитров со smotret-anime */
          {
            urlPattern: /^https:\/\/sub\.smotret-anime\.online\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sm-subtitles',
              expiration: {
                maxEntries: 100,
              },
            },
          },


          /**
           * Кэш обращений к api MyAnimeList
           */
          {
            urlPattern: /^https:\/\/api.jikan.moe\/v3\/anime\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mal-api',
              expiration: {
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 дней
              },
            },
          },

          /** Кэш изображений с shikimori */
          {
            urlPattern: /^https:\/\/shikimori.one\/system\/animes\/.*\.(jpg|png|jpeg).*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'shiki-images',
              expiration: {
                maxEntries: 1000,
              },
            },
          },


        ],
      },
    }),

    copy({
      verbose: true,
      hook: 'writeBundle',
      targets: [{
        src: [
          './src/pages/Watch/VideoPlayer/libass-wasm/subtitles-octopus-worker.data',
          './src/pages/Watch/VideoPlayer/libass-wasm/subtitles-octopus-worker.wasm',
        ],
        dest: './dist',
      }],
    }),
  ],
};

export default config;
