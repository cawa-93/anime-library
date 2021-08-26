import {createIpcClient} from '/@/ipc';
import type {UserSettings} from '/@shared/types/ipc/UserSettingsController';


const userSettings = createIpcClient('UserSettingsController');
const currentColorScheme = createIpcClient('ColorSchemeController');



export function getScheme(): Promise<UserSettings['color_scheme'] | undefined> {
  return userSettings.get('color_scheme', 'system');
}


export async function setScheme(scheme: UserSettings['color_scheme']): Promise<void> {
  await Promise.all([
    userSettings.set('color_scheme', scheme),
    currentColorScheme.setColorScheme(scheme),
  ]);
}
