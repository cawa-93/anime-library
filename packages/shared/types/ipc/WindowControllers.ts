import type {IpcHost} from './index';

export interface WindowControllers extends IpcHost {
  minimize: () => void
  maximize: () => void
  unmaximize: () => void
  close: () => void
  isMaximized: () => boolean
}

