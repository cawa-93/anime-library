import type {HostBase, MethodOnlyHost} from './Host';


interface WindowControllersBase extends HostBase {
  minimize: () => void
  maximize: () => void
  unmaximize: () => void
  close: () => void
  isMaximized: () => boolean
}


export type WindowControllers = MethodOnlyHost<WindowControllersBase>
