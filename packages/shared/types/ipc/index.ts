import type {WindowControllers} from './WindowControllers';
import type {DialogsControllers} from './DialogsControllers';
import type {HostBase} from './Host';
import type {ClearIndex} from '../utils';



interface IpcNameHostsMapBase extends Record<string, HostBase> {
  'WindowControllers': WindowControllers
  'DialogsControllers': DialogsControllers
}


export type IpcNameHostsMap = ClearIndex<IpcNameHostsMapBase>
