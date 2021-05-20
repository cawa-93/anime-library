import type {IpcHost} from './Host';


export type DialogsControllers = IpcHost<{
  showError: (title: string, content: string) => void
}>
