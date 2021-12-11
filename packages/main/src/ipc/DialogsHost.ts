import type {Dialog} from 'electron';
import {dialog, ipcMain} from 'electron';
import {IpcChannels} from '/@shared/ipcChannels';



ipcMain.handle(IpcChannels.Dialog, (_, method: keyof Dialog, ...args: any[]) => {
  const validateMethod = (m: keyof typeof dialog): m is keyof Electron.Dialog => typeof dialog[m] === 'function';

  if (!validateMethod(method)) {
    throw new TypeError(`Electron.Dialog.${method} is not a function`);
  }

  // @ts-expect-error Предотвращение ошибки типов выполняется шагом ранее в рантайме
  return dialog[method](...args);
});
