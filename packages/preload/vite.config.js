import {chrome} from '../../.electron-vendors.cache.json';
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
  root: PACKAGE_ROOT,
  envDir: process.cwd(),
  logLevel: 'warn',
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
      '/@shared/': join(PACKAGE_ROOT, '../shared') + '/',
    },
  },
  build: {
    sourcemap: process.env.MODE === 'development' ? 'inline' : true,
    target: `chrome${chrome}`,
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
