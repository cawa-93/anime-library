import type * as sm from '/@/utils/videoProvider/providers/anime365/anime365-interfaces';
import {getAccessToken} from '/@/utils/videoProvider/providers/anime365/anime365';


export const ANIME365_ORIGIN = 'https://anime365.ru';
export const API_BASE = `${ANIME365_ORIGIN}/api/`;


export async function request<T>(
  url: string | URL,
  access_token = getAccessToken(),
  options?: RequestInit,
): Promise<sm.ApiResponse<T>> {

  if (!(url instanceof URL)) {
    url = new URL(url);
  }

  if (access_token) {
    url.searchParams.set('access_token', access_token);
  }

  const response = await fetch(String(url), options);
  if (!response.ok) {
    throw await response.text();
  }

  return await response.json();
}


export function isFailureResponse(response: unknown): response is sm.ApiResponseFailure {
  return typeof response === 'object' && response !== null && (response as sm.ApiResponseSuccess<unknown>).data === undefined;
}
