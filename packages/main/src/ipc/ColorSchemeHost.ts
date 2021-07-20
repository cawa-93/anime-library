import type {ColorSchemeController} from '/@shared/types/ipc/ColorSchemeController';
import {nativeTheme} from 'electron';

class ColorSchemeHost implements ColorSchemeController {
  setColorScheme(scheme: 'system' | 'light' | 'dark'): boolean {
    nativeTheme.themeSource = scheme;
    return nativeTheme.shouldUseDarkColors;
  }
}

export default new ColorSchemeHost();
