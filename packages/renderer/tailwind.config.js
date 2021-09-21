import {defineConfig} from 'windicss/helpers';
// import formsPlugin from 'windicss/plugin/forms';

export default defineConfig({
  darkMode: 'media',
  extract: {
    include: ['./index.html', './src/**/*.vue'],
  },
});
