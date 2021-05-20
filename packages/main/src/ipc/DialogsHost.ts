import type {DialogsControllers} from '/@shared/types/ipc/DialogsControllers';
import {dialog} from 'electron';

class DialogsHost implements DialogsControllers {
  showError(title: string, content: string): void {
    return dialog.showErrorBox(title, content);
  }

}

export default new DialogsHost();
