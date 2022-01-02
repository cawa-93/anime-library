/* eslint-env node */

import type {ElectronApplication, Page} from 'playwright';
import {_electron as electron} from 'playwright';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';


let electronApp: ElectronApplication;
let page: Page;

beforeAll(async () => {
  electronApp = await electron.launch({args: ['.']});
  page = await electronApp.firstWindow();
});

describe('Параметры главного окна', () => {
  /**
   * App main window state
   * @type {{isVisible: boolean; isDevToolsOpened: boolean; isCrashed: boolean}}
   */
  let windowState;
  beforeAll(async () => {
    windowState = await electronApp.evaluate(({BrowserWindow}) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];

      const getState = () => ({
        isVisible: mainWindow.isVisible(),
        isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
        isCrashed: mainWindow.webContents.isCrashed(),
      });

      return new Promise((resolve) => {
        if (mainWindow.isVisible()) {
          resolve(getState());
        } else
          mainWindow.once('ready-to-show', () => setTimeout(() => resolve(getState()), 1000));
      });
    });
  });


  test('Должно быть видимым', async () => {
    const {isCrashed, isVisible} = windowState;
    expect(isCrashed).toBeFalsy();
    expect(isVisible).toBeTruthy();
  });

  test('DevTools должен быть закрыт', async () => {
    const {isDevToolsOpened} = windowState;
    expect(isDevToolsOpened).toBeFalsy();
  });
});

describe('Веб-страница', () => {
  test('Рутовый элемент не должен быть пустым', async () => {
    const element = await page.$('#app-root', {strict: true});
    expect(element).not.toBe(null);
    const content = (await element.innerHTML()).trim();
    expect(content).not.toBe('');
  });

  test('В консоли не должно быть ошибок', async () => {
    const errorLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorLogs.push(msg);
      }
    });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    if (errorLogs.length > 0) {
      errorLogs.forEach(console.error);
    }
    expect(errorLogs.length).toBe(0);
  });

});

afterAll(() => electronApp.close());
