import {app, BrowserWindow, protocol, session} from 'electron';
import {join} from 'path';
import {initialize} from '@electron/remote/dist/src/main';
import {createProtocol} from '/@/createCustomProtocol';

initialize();

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

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    show: false,
    width: 1920,
    height: 1080,
    minWidth: 380,
    frame: false,
    backgroundColor: '#fff',
    webPreferences: {
      preload: join(__dirname, '../../preload/dist/index.cjs'),
      contextIsolation: env.MODE !== 'test',   // Spectron tests can't work with contextIsolation: true
      enableRemoteModule: true,//env.MODE === 'test', // Spectron tests can't work with enableRemoteModule: false
    },
  });


  if (env.MODE === 'development') {
    mainWindow.webContents.once('dom-ready', () => mainWindow?.webContents.openDevTools());
  }

  mainWindow.addListener('ready-to-show', () => mainWindow?.show());

  /**
   * URL for main window.
   * `http://localhost:3000` - in development
   * {@link PROTOCOL}://./ - in production and test
   */
  const pageUrl = env.MODE === 'development'
    ? env.VITE_DEV_SERVER_URL
    : process.argv?.[1].startsWith?.(PROTOCOL)
      ? process.argv?.[1]
      : `${PROTOCOL}://./`;
  
  await mainWindow.loadURL(pageUrl);
};


app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.whenReady()
  .then(() => {
    env.MODE !== 'development' && createProtocol(PROTOCOL);
  })
  .then(() => {
    session.defaultSession.webRequest.onHeadersReceived({
      urls: ['https://smotret-anime.online/api/*'],
    }, (details, callback) => {

      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Access-Control-Allow-Origin': '*',
        },
      });
    });
  })
  .then(createWindow)
  .catch((e) => console.error('Failed create window:', e));


// Auto-updates
if (env.PROD) {
  app.whenReady()
    .then(() => import('electron-updater'))
    .then(({autoUpdater}) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) => console.error('Failed check updates:', e));
}

