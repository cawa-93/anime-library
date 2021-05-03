import type {WindowControllers} from '/@shared/types/ipc/WindowControllers';
import {BrowserWindow} from 'electron';

class WindowControllersHost implements WindowControllers {
  [x: string]: (...a: unknown[]) => unknown; // Prevent TS2420: Index signature is missing in type
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
