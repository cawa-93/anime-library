import type {WindowControllers} from '/@shared/types/ipc/WindowControllers';
import {BrowserWindow} from 'electron';

class WindowControllersHost implements WindowControllers {
  minimize() {
    BrowserWindow.getFocusedWindow()?.minimize();
  }

  maximize() {
    BrowserWindow.getFocusedWindow()?.maximize();
  }

  unmaximize() {
    BrowserWindow.getFocusedWindow()?.unmaximize();
  }

  close() {
    BrowserWindow.getFocusedWindow()?.close();
  }

  isMaximized() {
    return !!BrowserWindow.getFocusedWindow()?.isMaximized();
  }
}

export default new WindowControllersHost();
