import {defineConfig} from 'windicss/helpers';
import formsPlugin  from 'windicss/plugin/forms';
import colors from 'windicss/colors';

export default defineConfig({
  // preflight: false,



  darkMode: 'media',
  extract: {
    include: ['./index.html', './src/**/*.vue'],
  },
  theme: {
    extend: {
      colors: {
        accent: {
          ...colors.indigo,
          DEFAULT: colors.indigo['500'],
          light: colors.indigo['200'],
          dark: colors.indigo['800'],
        },
      },
    },
  },
  plugins: [
    // typography,
    // formsPlugin,
  ],
});
