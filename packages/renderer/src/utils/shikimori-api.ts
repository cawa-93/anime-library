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


function getFreshCredentials(): Promise<Credentials | undefined> {
  const credentials = getCredentials();

  if (!credentials) {
    return Promise.resolve(undefined);
  }

  const isCredentialsFresh = credentials.created_at + credentials.expires_in > Date.now() / 1000;

  if (isCredentialsFresh) {
    return Promise.resolve(credentials);
  }

  return refreshCredentials({type: 'refresh_token', refresh_token: credentials.refresh_token});
}



export async function apiFetch<T>(input: RequestInfo, init: RequestInit = {}): Promise<T> {
  const credentials = await getFreshCredentials();

  if (credentials) {

    if (!init.headers) {
      init.headers = {};
    }

    (init.headers as Record<string, string>).Authorization = `${credentials.token_type} ${credentials.access_token}`;
  }


  return fetch(`https://shikimori.one/api/${input}`, init)
    .then(r => r.json());
}
