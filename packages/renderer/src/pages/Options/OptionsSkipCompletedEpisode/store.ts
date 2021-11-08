const LOCALSTORAGE_KEY = 'OptionsSkipCompletedEpisode';


export function getState(): boolean {
  return localStorage.getItem(LOCALSTORAGE_KEY) !== null;
}



export function setState(value: boolean): void {
  return value ? localStorage.setItem(LOCALSTORAGE_KEY, '') : localStorage.removeItem(LOCALSTORAGE_KEY);
}
