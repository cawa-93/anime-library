import {app, BrowserWindow, protocol, session} from 'electron';
import {join} from 'path';
import {createProtocol} from '/@/createCustomProtocol';
import windowStateKeeper from 'electron-window-state';
import {registerIpcHost} from '/@/ipc';
import WindowControllersHost from '/@/ipc/WindowControllersHost';
import {getSeriesId} from '/@shared/utils/getSeriesId';
import {URL} from 'url';
import DialogsHost from '/@/ipc/DialogsHost';

const isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}


const PROTOCOL = 'anime-lib';


/**
 * Workaround for TypeScript bug
 * @see https://github.com/microsoft/TypeScript/issues/41468#issuecomment-727543400
 */
const env = import.meta.env;


if (env.MODE !== 'development') {
  protocol.registerSchemesAsPrivileged([{
    scheme: PROTOCOL,
    privileges: {secure: true, standard: true, allowServiceWorkers: true, supportFetchAPI: true, stream: true},
  }]);

  app.setAsDefaultProtocolClient(PROTOCOL);
}


app.disableHardwareAcceleration();

// Install "Vue.js devtools"
if (env.MODE === 'development') {
  app.whenReady()
    .then(() => import('electron-devtools-installer'))
    .then(({default: installExtension, VUEJS3_DEVTOOLS}) => installExtension(VUEJS3_DEVTOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true,
      },
    }))
    .catch(e => console.error('Failed install extension:', e));
}

let mainWindow: BrowserWindow | null = null;

const getFullHref = (path: string) => {
  let host = env.MODE === 'development' ? env.VITE_DEV_SERVER_URL : `${PROTOCOL}://.`;
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
      return getFullHref(urlParsed.pathname + urlParsed.hash);
    }
    // eslint-disable-next-line no-empty
  } catch {
  }

  const animeId = getSeriesId(url);

  if (animeId !== undefined) {
    return getFullHref(`watch/${animeId}`);
  }
};

const createWindow = async (pageUrl?: string) => {
  const mainWindowState = windowStateKeeper({fullScreen: false});

  mainWindow = new BrowserWindow({
    show: false,
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    minWidth: 380,
    frame: false,
    backgroundColor: '#fff',
    webPreferences: {
      preload: join(__dirname, '../../preload/dist/index.cjs'),
      contextIsolation: env.MODE !== 'test',   // Spectron tests can't work with contextIsolation: true
      enableRemoteModule: env.MODE === 'test', // Spectron tests can't work with enableRemoteModule: false
    },
  });


  mainWindow.addListener('ready-to-show', () => {
    if (mainWindow) {
      mainWindowState.manage(mainWindow);
      mainWindow.show();

      if (env.MODE === 'development') {
        mainWindow.webContents.openDevTools();
      }
    }
  });


  /**
   * URL for main window.
   * `http://localhost:3000` - in development
   * {@link PROTOCOL}://./ - in production and test
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

  await mainWindow.loadURL(pageUrl);
};


app.on('second-instance', (event, argv) => {
  let resolved: string | undefined;
  const arg = getInitialArg(argv);
  if (arg) {
    resolved = getResolvedInitialPageUrl(arg);
  }

  if (mainWindow) {
    if (resolved) {
      mainWindow.loadURL(resolved);
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
    app.quit();
  }
});


app.whenReady()
  .then(() => {
    if (env.MODE !== 'development') {
      createProtocol(PROTOCOL);
    }

    registerIpcHost('WindowControllers', WindowControllersHost);
    registerIpcHost('DialogsControllers', DialogsHost);

    return createWindow();
  })
  .then(() => {
    session.defaultSession.webRequest.onHeadersReceived({
      urls: ['https://*/*'],
    }, (details, callback) => {


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
if (env.PROD) {
  app.whenReady()
    .then(() => import('electron-updater'))
    .then(({autoUpdater}) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) => {
      e.name = 'Auto-update error';
      console.error(e);
    });
}


