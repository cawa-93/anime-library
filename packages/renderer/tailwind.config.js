import {defineConfig} from 'windicss/helpers';
import colors from 'windicss/colors';

export default defineConfig({
  darkMode: 'media',
  extract: {
    include: ['./index.html', './src/**/*.vue'],
  },
  theme: {
    extend: {
      colors: {
        accent: {
          ...colors.yellow,
          DEFAULT: colors.yellow['400'],
          light: colors.indigo['100'],
          dark: colors.indigo['900'],
        },
      },
    },
  },
});
