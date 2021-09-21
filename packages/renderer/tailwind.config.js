import {defineConfig} from 'windicss/helpers';
// import formsPlugin from 'windicss/plugin/forms';

export default defineConfig({
  darkMode: 'media',
  extract: {
    include: ['./index.html', './src/**/*.vue'],
  },
  shortcuts: {
    'no-drag': {
      '-webkit-app-region': 'no-drag',
    },
    'drag-region': {
      '-webkit-app-region': 'drag',
    },
  },
});
