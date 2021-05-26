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


export function getAuthUrl(): string {
  const authURL = new URL('https://shikimori.one/oauth/authorize');
  authURL.searchParams.set('client_id', import.meta.env.VITE_SHIKI_CLIENT_ID);
  authURL.searchParams.set('redirect_uri', REDIRECT_URI);
  authURL.searchParams.set('response_type', 'code');
  authURL.searchParams.set('scope', 'user_rates');
  return authURL.toString();
}


export function refreshCredentials(request: { type: 'authorization_code', code: string } | { type: 'refresh_token', refresh_token: string }): Promise<Credentials> {
  const body: Record<string, string> = {
    client_id: import.meta.env.VITE_SHIKI_CLIENT_ID,
    client_secret: import.meta.env.VITE_SHIKI_CLIENT_SECRET,
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
    .then(r => r.json());
}



interface ShikiUserRate {
  created_at: string
  episodes: number
  id: number
  rewatches: number
  score?: number
  status: 'planned' | 'watching' | 'rewatching' | 'completed' | 'on_hold' | 'dropped'
  updated_at: string
}


export function getUserRate(seriesId: number): Promise<ShikiUserRate | null> {
  return apiFetch<{ user_rate: ShikiUserRate | null }>(`animes/${seriesId}`).then(r => r.user_rate);
}


interface ShikiUser {
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

  const [user, user_rate] = await Promise.all([
    getUser(),
    getUserRate(seriesId),
  ]);

  if (!user || !user.id) {
    return;
  }

  if (!user_rate) {
    return apiFetch<void>('v2/user_rates/', {
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
    });
  } else {

    if (user_rate.episodes === episodes && (user_rate.status === 'watching' || user_rate.status === 'rewatching')) {
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
    });
  }
}
