import {contextBridge, ipcRenderer} from 'electron';
import {IpcChannels} from '/@shared/ipcChannels';

contextBridge.exposeInMainWorld('hardwareAcceleration', {
  set: (v: boolean) => ipcRenderer.invoke(IpcChannels.HardwareAcceleration, v),
  get: (): Promise<boolean> => ipcRenderer.invoke(IpcChannels.HardwareAcceleration),
});
