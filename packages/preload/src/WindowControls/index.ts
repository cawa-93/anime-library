import {contextBridge, ipcRenderer} from 'electron';


ipcRenderer.on('WindowControls', (_, event: string) => globalThis.dispatchEvent(new Event(`electron-window:${event}`)));


contextBridge.exposeInMainWorld('maximize', () => ipcRenderer.send('WindowControls', 'maximize'));
contextBridge.exposeInMainWorld('unmaximize', () => ipcRenderer.send('WindowControls', 'unmaximize'));
contextBridge.exposeInMainWorld('minimize', () => ipcRenderer.send('WindowControls', 'minimize'));
