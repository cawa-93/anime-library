import type {BrowserWindow} from 'electron';
import {ipcMain} from 'electron';
import {IpcChannels} from '/@shared/ipcChannels';


export class WindowControls {
  public window: BrowserWindow;


  constructor(window: BrowserWindow) {
    this.window = window;

    const eventsForSend = [
      'maximize',
      'unmaximize',
    ] as const;

    // @ts-expect-error У Electron нет общего типа для возможных событий
    eventsForSend.forEach(event => this.window.on(event, () => this.sendEvent(event)));


    const eventsToHandle = [
      'minimize',
      'maximize',
      'unmaximize',
    ] as const;

    ipcMain.on(IpcChannels.WindowControls, (_, event: unknown) => {
      if (typeof event !== 'string' || !eventsToHandle.includes(event as typeof eventsToHandle[number])) {
        return;
      }
      this.window[event as typeof eventsToHandle[number]]();
    });

    // Send initial state
    this.sendEvent(this.window.isMaximized() ? 'maximize' : 'unmaximize');
    this.window.webContents.on(
      'dom-ready',
      () => this.sendEvent(this.window.isMaximized() ? 'maximize' : 'unmaximize'));
  }



  private sendEvent(event: string) {
    this.window.webContents.send(IpcChannels.WindowControls, event);
  }
}
