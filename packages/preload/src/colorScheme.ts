import type {NativeTheme} from 'electron';
import {contextBridge, ipcRenderer} from 'electron';
import {IpcChannels} from '/@shared/ipcChannels';


contextBridge.exposeInMainWorld(
  'colorScheme',
  {
    set: (scheme: NativeTheme['themeSource']): Promise<void> => ipcRenderer.invoke(IpcChannels.ColorScheme, scheme),
    get: (): Promise<NativeTheme['themeSource']> => ipcRenderer.invoke(IpcChannels.ColorScheme),
  },
);
