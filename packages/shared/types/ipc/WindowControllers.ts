import type {IpcHost} from '/@shared/types/ipc';


export interface WindowControllers extends IpcHost {
  minimize: () => void
  maximize: () => void
  unmaximize: () => void
  close: () => void
  isMaximized: () => boolean
}

