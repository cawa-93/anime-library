import type {DialogsControllers} from '../../../shared/types/ipc/DialogsControllers';
import {dialog} from 'electron';

class DialogsHost implements DialogsControllers {
  [x: string]: (...a: any[]) => any;
  showError(title: string, content: string): void {
    return dialog.showErrorBox(title, content);
  }

}

export default new DialogsHost();
