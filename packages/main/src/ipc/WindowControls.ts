import {app, BrowserWindow, ipcMain} from 'electron';
import {IpcChannels} from '/@shared/ipcChannels';


/**
 * При создании нового окна начать следить за его состоянием
 * и отправлять изменения состояния в webContents
 */
app.on('browser-window-created', (_, window) => {

  const sendState = () => window.webContents.send(
    IpcChannels.WindowControls,
    window.isMaximized() ? 'maximize' : 'unmaximize',
  );

  window.on('maximize', sendState);
  window.on('unmaximize', sendState);

  window.webContents.on('dom-ready', sendState);
  sendState();
});


/**
 * Обработка команд из webContents и изменение состояния окна по запросу
 */
ipcMain.on(IpcChannels.WindowControls, (event, command: string) => {

  if (command !== 'maximize' && command !== 'unmaximize' && command !== 'minimize') {
    return;
  }

  const window = BrowserWindow.fromWebContents(event.sender);

  if (!window) {
    return;
  }

  window[command]();
});
