import type {WindowControllers} from './WindowControllers';
import type {DialogsControllers} from './DialogsControllers';
import type {IpcHost} from './Host';
import type {ClearIndex, Fn} from '../utils';



interface IpcNameHostsMapBase extends Record<string, IpcHost<Record<string, Fn>>> {
  'WindowControllers': WindowControllers
  'DialogsControllers': DialogsControllers
}


export type IpcNameHostsMap = ClearIndex<IpcNameHostsMapBase>
