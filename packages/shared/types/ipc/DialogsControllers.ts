import type {IpcHost} from './ipcHost';

export interface DialogsControllers extends IpcHost {
  showError: (title: string, content: string) => void
}
