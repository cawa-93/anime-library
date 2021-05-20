import type {HostBase, MethodOnlyHost} from './Host';


interface DialogsControllersBase extends HostBase {
  showError: (title: string, content: string) => void
}


export type DialogsControllers = MethodOnlyHost<DialogsControllersBase>
