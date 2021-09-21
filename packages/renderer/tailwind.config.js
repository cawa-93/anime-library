import {defineConfig} from 'windicss/helpers';
import formsPlugin from 'windicss/plugin/forms';
import colors from 'windicss/colors';

export default defineConfig({
  darkMode: 'media',
  extract: {
    include: ['./index.html', './src/**/*.vue'],
  },
  theme: {
    extend: {
      colors: {
        accent: colors.blue,
      },
    },
  },
  plugins: [
    // formsPlugin,
  ],
});
