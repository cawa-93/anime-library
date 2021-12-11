import {contextBridge, ipcRenderer} from 'electron';
import {IpcChannels} from '/@shared/ipcChannels';


ipcRenderer.on(IpcChannels.WindowControls, (_, event: string) => globalThis.dispatchEvent(new Event(`electron-window:${event}`)));


contextBridge.exposeInMainWorld('maximize', () => ipcRenderer.send(IpcChannels.WindowControls, 'maximize'));
contextBridge.exposeInMainWorld('unmaximize', () => ipcRenderer.send(IpcChannels.WindowControls, 'unmaximize'));
contextBridge.exposeInMainWorld('minimize', () => ipcRenderer.send(IpcChannels.WindowControls, 'minimize'));
