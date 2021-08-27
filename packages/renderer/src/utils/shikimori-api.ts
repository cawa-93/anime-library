import {deDuplicatedRequest} from '/@/utils/deDuplicatedRequest';


interface Credentials {
  access_token: string,
  token_type: 'Bearer',
  expires_in: number,
  refresh_token: string,
  scope: string,
  created_at: number
}


const REDIRECT_URI = 'anime-lib://./options/';


/**
 * @returns {{client_id: string; client_secret: string}}
 */
function getApp() {
  const client_id = import.meta.env.VITE_SHIKI_CLIENT_ID;

  if (typeof client_id !== 'string') {
    throw new Error(`Expected VITE_SHIKI_CLIENT_ID as string but got ${JSON.stringify(import.meta.env.VITE_SHIKI_CLIENT_ID)}.`);
  }

  const client_secret = import.meta.env.VITE_SHIKI_CLIENT_SECRET;

  if (typeof client_secret !== 'string') {
    throw new Error(`Expected VITE_SHIKI_CLIENT_SECRET as string but got is ${JSON.stringify(import.meta.env.VITE_SHIKI_CLIENT_SECRET)}.`);
  }

  return {client_id, client_secret};
}


export function getAuthUrl(): string {
  const {client_id} = getApp();

  const authURL = new URL('https://shikimori.one/oauth/authorize');
  authURL.searchParams.set('client_id', client_id);
  authURL.searchParams.set('redirect_uri', REDIRECT_URI);
  authURL.searchParams.set('response_type', 'code');
  authURL.searchParams.set('scope', 'user_rates');
  return authURL.toString();
}


/**
 * Получает новый `access_token` по переданному `authorization_code` или `refresh_token`
 * @param request
 */
export function refreshCredentials(request: { type: 'authorization_code', code: string } | { type: 'refresh_token', refresh_token: string }): Promise<Credentials> {
  const {client_id, client_secret} = getApp();
  const body: Record<string, string> = {
    client_id,
    client_secret,
    grant_type: request.type,
  };

  if (request.type === 'authorization_code') {
    body.code = request.code;
    body.redirect_uri = REDIRECT_URI;
  } else {
    body.refresh_token = request.refresh_token;
  }

  return fetch('https://shikimori.one/oauth/token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then(r => r.json())
    .then(credentials => {
      if (!isValidCredentials(credentials)) {
        throw credentials;
      }
      saveCredentials(credentials);
      return credentials;
    });
}



function isValidCredentials(data: unknown): data is Credentials {
  return typeof data === 'object'
    && data !== null
    && 'access_token' in data
    && 'token_type' in data
    && 'expires_in' in data
    && 'refresh_token' in data
    && 'scope' in data && (data as Credentials).scope === 'user_rates'
    && 'created_at' in data;
}


export function clearCredentials(): void {
  return localStorage.removeItem('shiki-token');
}


function saveCredentials(credentials: unknown): void {
  if (!isValidCredentials(credentials)) {
    throw new Error('Can not save invalid credentials: ' + JSON.stringify(credentials));
  }

  localStorage.setItem('shiki-token', JSON.stringify(credentials));
}


function getCredentials(): Credentials | undefined {
  const credentials = localStorage.getItem('shiki-token');
  return credentials ? JSON.parse(credentials) : undefined;
}


export function isLoggedIn(): boolean {
  return localStorage.getItem('shiki-token') !== null;
}


function getFreshCredentials(): Promise<Credentials | undefined> {
  const credentials = getCredentials();

  if (!credentials) {
    return Promise.resolve(undefined);
  }

  const isCredentialsFresh = credentials.created_at + credentials.expires_in > Date.now() / 1000;

  if (isCredentialsFresh) {
    return Promise.resolve(credentials);
  }

  return deDuplicatedRequest('getFreshCredentials', () => refreshCredentials({
    type: 'refresh_token',
    refresh_token: credentials.refresh_token,
  }).catch(e => {
    console.error(e);
    return undefined;
  }));

}



export async function apiFetch<T>(input: RequestInfo, init: RequestInit = {}): Promise<T> {
  const credentials = await getFreshCredentials();

  if (credentials) {

    if (!init.headers) {
      init.headers = {};
    }

    (init.headers as Record<string, string>).Authorization = `${credentials.token_type} ${credentials.access_token}`;
    (init.headers as Record<string, string>).Accept = 'application/json';
    (init.headers as Record<string, string>)['Content-Type'] = 'application/json';
  }


  return fetch(`https://shikimori.one/api/${input}`, init)
    .then(r => {
      if (r.ok) {
        return r.json();
      }

      return r.text().then(text => {
        const e = new Error(text);
        e.name = 'API Error';
        return Promise.reject(e);
      });
    });
}



interface ShikiUserRate {
  created_at: string;
  episodes: number;
  id: number;
  rewatches: number;
  score?: number;
  status: 'planned' | 'watching' | 'rewatching' | 'completed' | 'on_hold' | 'dropped';
  updated_at: string;
}


/**
 * Кэш последних сохранений в историю просмотров Шики
 */
const savedUserRatesCache = new Map<number, number>();


export function getUserRate(seriesId: number): Promise<ShikiUserRate | null> {
  return apiFetch<{ user_rate: ShikiUserRate | null }>(`animes/${seriesId}`).then(({user_rate}) => {
    if (user_rate?.episodes) {
      savedUserRatesCache.set(seriesId, user_rate.episodes);
    }
    return user_rate;
  }).catch(e => {
    console.error(e);
    return null;
  });
}


export interface ShikiUser {
  id: number
  nickname: string,
  avatar: string
  url: string
}


export function getUser(): Promise<ShikiUser> {
  return apiFetch<ShikiUser>('users/whoami');
}



export async function saveUserRate(seriesId: number, episodes: number): Promise<void> {

  if (!isLoggedIn()) {
    return;
  }

  if (savedUserRatesCache.get(seriesId) === episodes) {
    return;
  }

  const user_rate = await getUserRate(seriesId);

  if (!user_rate) {
    const user = await getUser();

    if (!user?.id) {
      return;
    }

    return apiFetch<ShikiUserRate>('v2/user_rates/', {
      method: 'POST',
      body: JSON.stringify({
        user_rate: {
          user_id: user.id,
          episodes: String(episodes),
          status: 'watching',
          target_id: seriesId,
          target_type: 'Anime',
        },
      }),
    }).then(() => {
      savedUserRatesCache.set(seriesId, episodes);
    });
  }

  if (user_rate.episodes === episodes && (user_rate.status === 'watching' || user_rate.status === 'rewatching')) {
    savedUserRatesCache.set(seriesId, episodes);
    return;
  }

  return apiFetch<void>(`v2/user_rates/${user_rate.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      user_rate: {
        episodes: String(episodes),
        status: (user_rate.status === 'watching' || user_rate.status === 'rewatching')
          ? undefined
          : user_rate.status === 'completed' ? 'rewatching' : 'watching',
      },
    }),
  }).then(() => {
    savedUserRatesCache.set(seriesId, episodes);
  });
}


export interface Genre {
  id: number;
  name: string;
  russian: string;
  kind: 'anime';
}
