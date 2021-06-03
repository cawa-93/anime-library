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
    // Предполагается что у приложения может быть только одно окно
    return BrowserWindow.getAllWindows()[0].isMaximized();
  }
}

export default new WindowControllersHost();
