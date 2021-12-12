import path from 'path';
import type {IpcMainInvokeEvent} from 'electron';
import {app, ipcMain} from 'electron';
import fs from 'fs';
import {IpcChannels} from '/@shared/ipcChannels';


const FLAG_FILE_PATH = path.join(app.getPath('userData'), 'ENABLE_HARDWARE_ACCELERATION');



/**
 * Проверить параметры и выключить аппаратное ускорение если необходимо.
 * Операция должна выполняться до события app-ready и в синхронном режиме
 */
{
  let shouldDisableHardwareAcceleration = true;
  try {
    if (fs.existsSync(FLAG_FILE_PATH)) {
      shouldDisableHardwareAcceleration = false;
    }
    // eslint-disable-next-line no-empty
  } catch (_) {}

  if (shouldDisableHardwareAcceleration) {
    app.disableHardwareAcceleration();
  }
}



ipcMain.handle(IpcChannels.HardwareAcceleration, (_: IpcMainInvokeEvent, state?: boolean) => {
  if (state === true) {
    return fs.promises.writeFile(FLAG_FILE_PATH, '', {encoding: 'utf8'});
  }

  if (state === false) {
    return fs.promises.unlink(FLAG_FILE_PATH).catch();
  }

  if (state === undefined) {
    return fs.promises.access(FLAG_FILE_PATH).then(() => true).catch(() => false);
  }
});
