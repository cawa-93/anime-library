import {node} from '../../.electron-vendors.cache.json';
import {join} from 'path';
import {builtinModules} from 'module';
import {getAppVersion} from '../../getAppVersion.cjs';

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
  envDir: process.cwd(),
  root: PACKAGE_ROOT,
  logLevel: 'warn',
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
      '/@shared/': join(PACKAGE_ROOT, '../shared') + '/',
    },
  },
  build: {
    sourcemap: process.env.MODE === 'development' ? 'inline' : true,
    target: `node${node}`,
    outDir: 'dist',
    assetsDir: '.',
    minify: process.env.MODE === 'development' ? false : 'esbuild',
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: [
        'electron',

        /**
         * electron-devtools-installer не может быть обработан из-за ошибки
         * https://github.com/cawa-93/vite-electron-builder/issues/346
         */
        'electron-devtools-installer',

        /**
         * @sentry/electron не может быть обработан из-за того, что его исходники зависят от собственного `package.json`
         */
        '@sentry/electron/dist/main',

        ...builtinModules,
      ],
      output: {
        entryFileNames: '[name].cjs',
      },
    },
    emptyOutDir: true,
  },
};

export default config;
