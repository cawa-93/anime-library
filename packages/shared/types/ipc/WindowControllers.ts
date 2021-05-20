import type {IpcHost} from './Host';


export type WindowControllers = IpcHost<{
  minimize: () => void
  maximize: () => void
  unmaximize: () => void
  close: () => void
  isMaximized: () => boolean
}>
