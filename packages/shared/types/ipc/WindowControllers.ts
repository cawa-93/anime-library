import type {IpcHost} from './ipcHost';

export interface WindowControllers extends IpcHost {
  minimize: () => void
  maximize: () => void
  unmaximize: () => void
  close: () => void
  isMaximized: () => boolean
}
