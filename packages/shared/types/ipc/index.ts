import type {WindowControllers} from './WindowControllers';
import type {DialogsControllers} from './DialogsControllers';
import type {IpcHost} from './Host';
import type {ClearIndex, Fn} from '../utils';
import type {UserSettingsController} from './UserSettingsController';
import type {ColorSchemeController} from './ColorSchemeController';



interface IpcNameHostsMapBase extends Record<string, IpcHost<Record<string, Fn>>> {
  'WindowControllers': WindowControllers
  'DialogsControllers': DialogsControllers
  'UserSettingsController': UserSettingsController
  'ColorSchemeController': ColorSchemeController
}


export type IpcNameHostsMap = ClearIndex<IpcNameHostsMapBase>
