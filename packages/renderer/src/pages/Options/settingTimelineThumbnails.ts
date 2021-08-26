const LOCALSTORAGE_KEY = 'enable_timeline_thumbnails';


export function isEnabled(): boolean {
  return localStorage.getItem(LOCALSTORAGE_KEY) === 'true';
}

export function setEnabled(value: boolean): void {
  localStorage.setItem(LOCALSTORAGE_KEY, value ? 'true' : 'false');
}
