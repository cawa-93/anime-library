import type {Dialog} from 'electron';
import {contextBridge, ipcRenderer} from 'electron';
import {IpcChannels} from '/@shared/ipcChannels';


function invoke(method: keyof Dialog, title: string, content?: string) {
  return ipcRenderer.invoke(IpcChannels.Dialog, method, title, content);
}


contextBridge.exposeInMainWorld('dialog', {
  showError: (title: string, message: string): Promise<void> => invoke('showErrorBox', title, message),
});
