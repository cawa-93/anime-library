import type {Dialog, IpcMainInvokeEvent} from 'electron';
import {dialog, ipcMain} from 'electron';
import {IpcChannels} from '/@shared/ipcChannels';



function listener(_: IpcMainInvokeEvent, method: keyof Dialog, ...args: unknown[]) {
  if (method === 'showErrorBox') {
    const [title, content] = args as Parameters<Dialog[typeof method]>;
    return dialog.showErrorBox(title, content);
  }

  throw new TypeError(`Electron.Dialog.${method} method is not implemented`);
}


ipcMain.handle(IpcChannels.Dialog, listener);
