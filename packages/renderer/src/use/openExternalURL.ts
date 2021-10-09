/**
 * Открывает ссылку в браузере
 * @param url
 */
export function openExternalURL(url: string): void {
  if (!window.openExternalURL) {
    console.error(new Error('Глобальный метод openExternalURL не существует'));
    return;
  }

  return window.openExternalURL(url);
}
