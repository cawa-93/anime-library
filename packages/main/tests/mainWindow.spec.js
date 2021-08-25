/* eslint-env node, jest */

const {Application} = require('spectron');

const app = new Application({
  path: require('electron'),
  requireName: 'electronRequire',
  args: ['.'],
});

jest.setTimeout(10000);

beforeAll(async () => {
  await app.start();
});

afterAll(async () => {
  if (app && app.isRunning()) await app.stop();
});

describe('Главное окно', () => {

  test('Должно быть видимым', async () => {
    const isVisible = await app.browserWindow.isVisible();
    expect(isVisible).toBeTruthy();
  });

  test('DevTools должен быть закрыт', async () => {
    const isDevtoolsOpen = await app.webContents.isDevToolsOpened();
    expect(isDevtoolsOpen).toBeFalsy();
  });

  test('Не может быть пустым', async () => {
    const content = await app.client.$('#app-root');
    const innerHTML = (await content.getHTML(false)).trim();
    expect(innerHTML).not.toBe('');
  });

  test('Не должно содержать ошибок в консоли', async () => {
    /** @type {{level: 'SEVERE' | 'WARNING'}[]} */
    const logs = await app.client.getRenderProcessLogs();
    const errorLogsCount = logs.filter(log => log.level === 'SEVERE').length;
    expect(errorLogsCount).toBe(0);
  });
});
