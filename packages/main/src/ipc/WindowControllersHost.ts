import type {WindowControllers} from '/@shared/types/ipc/WindowControllers';
import {BrowserWindow} from 'electron';

class WindowControllersHost implements WindowControllers {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: (...a: any[]) => any; // Prevent TS2420: Index signature is missing in type

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
