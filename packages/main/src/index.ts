import {app, BrowserWindow, nativeTheme, protocol, session} from 'electron';
import {join} from 'path';
import {createProtocol} from '/@/createCustomProtocol';
import windowStateKeeper from 'electron-window-state';
import {registerIpcHost} from '/@/ipc';
import WindowControllersHost from '/@/ipc/WindowControllersHost';
import {getSeriesId} from '/@shared/utils/getSeriesId';
import {URL} from 'url';
import DialogsHost from '/@/ipc/DialogsHost';
import * as UserSettings from './userSettingController';
import ColorSchemeHost from '/@/ipc/ColorSchemeHost';


const isSingleInstance = app.requestSingleInstanceLock();


if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}


const PROTOCOL = 'anime-lib';


if (import.meta.env.MODE !== 'development') {
  protocol.registerSchemesAsPrivileged([{
    scheme: PROTOCOL,
    privileges: {secure: true, standard: true, allowServiceWorkers: true, supportFetchAPI: true, stream: true},
  }]);

  app.setAsDefaultProtocolClient(PROTOCOL);
}


/**
 * Загрузка настроек приложения
 */
if (!UserSettings.getSync('enable_hardware_acceleration')) {
  app.disableHardwareAcceleration();
}

nativeTheme.themeSource = UserSettings.getSync('color_scheme') || 'system';


/**
 * Install "Vue.js devtools"
 */
if (import.meta.env.MODE === 'development') {
  app.whenReady()
    .then(() => import('electron-devtools-installer'))
    .then(({default: installExtension, VUEJS3_DEVTOOLS}) => installExtension(VUEJS3_DEVTOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true,
      },
    }))
    .catch(e => console.error('Failed install extension:', e));
}



const getFullHref = (path: string) => {
  let host = import.meta.env.MODE === 'development' && import.meta.env.VITE_DEV_SERVER_URL !== undefined
    ? import.meta.env.VITE_DEV_SERVER_URL
    : `${PROTOCOL}://.`;
  if (host.endsWith('/')) {
    host = host.substring(0, host.length - 1);
  }

  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  const url = new URL(`${host}${path}`);


  if (!url.pathname.endsWith('/')) {
    url.pathname = url.pathname + '/';
  }

  return url.toString();
};

const getInitialArg = (argv: string[]) => {
  return argv.find(s => s.startsWith(`${PROTOCOL}:`));
};

const getResolvedInitialPageUrl = (url: string): string | undefined => {
  try {
    const urlParsed = new URL(url);
    if (urlParsed.protocol === PROTOCOL + ':' && urlParsed.hostname === '.') {
      return getFullHref(urlParsed.pathname + urlParsed.search + urlParsed.hash);
    }
    // eslint-disable-next-line no-empty
  } catch {
  }

  const animeId = getSeriesId(url);

  if (animeId !== undefined) {
    return getFullHref(`watch/${animeId}`);
  }
};



let mainWindow: BrowserWindow | null = null;


const createWindow = async (pageUrl?: string) => {
  const mainWindowState = windowStateKeeper({fullScreen: false});

  mainWindow = new BrowserWindow({
    show: false,
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    minWidth: 430,
    frame: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1b1d1f' : '#fff',
    webPreferences: {
      nativeWindowOpen: true,
      preload: join(__dirname, '../../preload/dist/index.cjs'),
    },
  });

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindowState.manage(mainWindow);
      mainWindow.show();
      if (import.meta.env.MODE === 'development') {
        mainWindow.webContents.openDevTools();
      }
    }
  });


  /**
   * URL for main window.
   * `http://localhost:3000` - in development
   * {@link PROTOCOL}://./ - in production
   */
  if (!pageUrl) {
    const arg = getInitialArg(process.argv);
    if (arg) {
      pageUrl = getResolvedInitialPageUrl(arg);
    }

    if (!pageUrl) {
      pageUrl = getFullHref('/');
    }
  }

  await loadUrl(pageUrl);
};


function loadUrl(url: string) {
  if (!mainWindow) {
    return Promise.reject(`mainWindow is ${typeof mainWindow}`);
  }

  const ref = (getInitialArg(process.argv) || '').replace(`${PROTOCOL}`, 'https').replace('//./', '//localhost/');
  return mainWindow.loadURL(url, {
    httpReferrer: {
      url: ref,
      policy: 'unsafe-url',
    },
  });
}


app.on('second-instance', (event, argv) => {
  let resolved: string | undefined;
  const arg = getInitialArg(argv);
  if (arg) {
    resolved = getResolvedInitialPageUrl(arg);
  }

  if (mainWindow) {
    if (resolved) {
      loadUrl(resolved);
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.focus();
  } else {
    createWindow(resolved);
  }
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    /**
     * Перед выходом приложения необходимо сделать небольшую задержку,
     * чтобы успели отправиться все сетевые запросы.
     * Например это важно чтобы отправлять в аналитику событие выхода из приложения
     */
    setTimeout(() => app.quit(), 1000);
  }
});


app.whenReady()
  .then(() => {
    if (import.meta.env.MODE !== 'development') {
      createProtocol(PROTOCOL);
    }

    registerIpcHost('WindowControllers', WindowControllersHost);
    registerIpcHost('DialogsControllers', DialogsHost);
    registerIpcHost('ColorSchemeController', ColorSchemeHost);
    registerIpcHost('UserSettingsController', {
      get: UserSettings.get,
      set: UserSettings.set,
    });

    return createWindow();
  })
  .then(() => {
    session.defaultSession.webRequest.onHeadersReceived({
      urls: ['https://*/*'],
    }, (details, callback) => {

      if (details.responseHeaders) {
        delete details.responseHeaders['Access-Control-Allow-Origin'];
      }

      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'access-control-allow-origin': '*',
        },
      });
    });
  })
  .catch((e) => console.error('Failed create window:', e));


// Auto-updates
if (import.meta.env.PROD) {
  app.whenReady()
    .then(() => import('electron-updater'))
    .then(({autoUpdater}) =>
      autoUpdater.checkForUpdatesAndNotify({
        title: 'Новая версия готова к установке',
        body: 'Обновление приложения будет автоматически установлено после того как вы его закроете',
      }),
    )
    .catch((e) => {
      e.name = 'Auto-update error';
      console.error(e);
    });
}


