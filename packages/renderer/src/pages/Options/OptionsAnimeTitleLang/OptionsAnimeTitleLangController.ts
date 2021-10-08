

type AnimeTitleLang = 'ru' | 'romaji'

export const KEY = 'options/animeTitleLang';


export function getLang(): AnimeTitleLang {
  const val = localStorage.getItem(KEY);
  if (val === 'romaji') {
    return 'romaji';
  }

  return 'ru';
}


export function setLang(lang: AnimeTitleLang): void {
  localStorage.setItem(KEY, lang);
}
