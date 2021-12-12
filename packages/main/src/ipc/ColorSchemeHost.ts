import {app, ipcMain, nativeTheme} from 'electron';
import path from 'path';
import fs from 'fs/promises';
import {IpcChannels} from '/@shared/ipcChannels';


const FLAG_FILE_PATH = path.join(app.getPath('userData'), 'COLOR_SCHEME');


function setThemeSource(scheme: string) {
  nativeTheme.themeSource = (scheme === 'system' || scheme === 'light' || scheme === 'dark') ? scheme : 'system';
  return fs.writeFile(FLAG_FILE_PATH, nativeTheme.themeSource, {encoding: 'utf8'});
}


function loadState() {
  fs.readFile(FLAG_FILE_PATH, {encoding: 'utf8'})
    .then(setThemeSource)
    .catch((e) => {
      console.error(e);
      return setThemeSource('system');
    });
}


loadState();

ipcMain.handle(IpcChannels.ColorScheme, (_, scheme: string) => {
  return scheme ? setThemeSource(scheme) : nativeTheme.themeSource;
});
