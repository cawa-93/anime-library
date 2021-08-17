import type * as sm from '/@/utils/videoProvider/providers/anime365-interfaces';
import type {Episode, Series, Translation, Video, VideoTrack} from '/@/utils/videoProvider';
import {getAuthor} from '/@/utils/videoProvider/providers/anime365-authors';
import {SECOND_MS} from '/@/utils/time';
import {resolveEpisodesList} from '/@/utils/videoProvider/providers/resolveEpisodesList';
import type {MalEpisode, MalResponse} from '/@/utils/videoProvider/providers/malEpisode';


const HOST_ROOT = 'https://smotret-anime.online';
const API_BASE = `${HOST_ROOT}/api/`;


async function request<T>(url: string | URL): Promise<sm.ApiResponse<T>> {

  if (!(url instanceof URL)) {
    url = new URL(url);
  }

  const access_token = getAccessToken();
  if (access_token) {
    url.searchParams.set('access_token', access_token);
  }

  const response = await fetch(String(url));
  if (!response.ok) {
    throw await response.text();
  }

  return await response.json();
}


export function isFailureResponse(response: sm.ApiResponseFailure | sm.ApiResponseSuccess<unknown>): response is sm.ApiResponseFailure {
  return (response as sm.ApiResponseSuccess<unknown>).data === undefined;
}


export async function searchSeries<RequestedFields extends keyof sm.Series>(searchParams: URLSearchParams): Promise<Pick<sm.Series, RequestedFields>[]> {
  const requestURL = new URL('series', API_BASE);
  searchParams.forEach((v, k) => requestURL.searchParams.set(k, v));

  requestURL.searchParams.set('isActive', '1');

  const apiResponse = await request<Pick<sm.Series, RequestedFields>[]>(requestURL);

  if (isFailureResponse(apiResponse)) {
    throw apiResponse.error;
  }

  return apiResponse.data;
}


export async function getSeries(myAnimeListId: number): Promise<Series | undefined> {
  const fields = ['titleLines', 'myAnimeListId', 'posterUrl'] as const;
  type RequestedFields = typeof fields[number]

  const searchParams = new URLSearchParams({
    fields: fields.join(','),
    myAnimeListId: String(myAnimeListId),
  });

  const searchResult = await searchSeries<RequestedFields>(searchParams);

  if (searchResult.length === 0) {
    return undefined;
  }

  const targetSeries = searchResult[0];
  if (searchResult.length > 1) {
    // TODO: Доработать алгоритм точного совпадения по myAnimeListId
    console.error(
      `По запросу {myAnimeListId: ${myAnimeListId}} было возвращено больше одного результата! Результатов возвращено: ${searchResult.length}`,
      {searchResult},
    );
  }

  return {
    id: targetSeries.myAnimeListId,
    title: targetSeries.titleLines[0],
    poster: targetSeries.posterUrl,
  };
}


export async function getEpisodes(myAnimeListId: number): Promise<Episode[]> {
  const fields = ['episodes', 'numberOfEpisodes', 'type'] as const;
  type RequestedFields = typeof fields[number]

  const searchParams = new URLSearchParams({
    fields: fields.join(','),
    myAnimeListId: String(myAnimeListId),
  });

  const searchResult = await searchSeries<RequestedFields>(searchParams);

  const targetSeries = searchResult[0];
  if (!targetSeries) {
    return [];
  }

  if (searchResult.length > 1) {
    // TODO: Доработать алгоритм точного совпадения по myAnimeListId
    console.error(
      `По запросу {myAnimeListId: ${myAnimeListId}} было возвращено больше одного результата! Результатов возвращено: ${searchResult.length}`,
      {searchResult},
    );
  }

  if (!targetSeries.episodes || !targetSeries.episodes.length) {
    return [];
  }

  const malEpisodes = await getEpisodesTitles(myAnimeListId);
  return resolveEpisodesList(targetSeries, malEpisodes);
}


async function getEpisodesTitles(seriesId: number, timeout = SECOND_MS * 3): Promise<Map<number, MalEpisode>> {
  const episodes = new Map<number, MalEpisode>();

  const controller = new AbortController();

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const firstPage: MalResponse | undefined = await fetch(`https://api.jikan.moe/v3/anime/${seriesId}/episodes/1`, {
    signal: controller.signal,
  })
    .then(r => r.json())
    .catch(e => {
      console.error(e);
      return undefined;
    });

  clearTimeout(timeoutId);


  if (!firstPage?.episodes?.length) {
    return episodes;
  }

  firstPage.episodes.forEach(e => episodes.set(e.episode_id, e));

  if (firstPage.episodes_last_page && firstPage.episodes_last_page > 1) {
    const promises: Promise<MalResponse>[] = [];
    for (let i = 2; i <= firstPage.episodes_last_page; i++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      promises.push(
        fetch(`https://api.jikan.moe/v3/anime/${seriesId}/episodes/${i}`, {signal: controller.signal})
          .then(r => r.json())
          .finally(() => clearTimeout(timeoutId)),
      );
    }

    const responses = await Promise.allSettled(promises);
    responses.forEach(response => {
      if (response.status === 'fulfilled' && response.value.episodes && response.value.episodes.length) {
        response.value.episodes.forEach(e => episodes.set(e.episode_id, e));
      }
    });
  }

  return episodes;
}


export async function getTranslations(episodeId: number): Promise<Translation[]> {
  const fields = ['id', 'authorsSummary', 'authorsList', 'episodeId', 'typeKind', 'typeLang', 'isActive', 'qualityType'] as const;
  type RequestedFields = typeof fields[number]
  type ResponseItem = Pick<sm.Translation, RequestedFields>
  type ExpectedResponse = Array<ResponseItem>

  const requestURL = new URL('translations', API_BASE);

  requestURL.searchParams.set('fields', fields.join(','));
  requestURL.searchParams.set('isActive', '1');
  requestURL.searchParams.set('limit', '0');
  requestURL.searchParams.set('episodeId', String(episodeId));

  // Отфильтровать не нужные переводы
  requestURL.searchParams.append('type[]', 'voiceRu');
  requestURL.searchParams.append('type[]', 'subRu');

  const apiResponse = await request<ExpectedResponse>(requestURL);

  if (isFailureResponse(apiResponse)) {
    throw apiResponse.error;
  }

  const isRuVoiceOrRuSub =
    (t: ResponseItem):
      t is Pick<sm.TranslationSub, RequestedFields> | Pick<sm.TranslationVoice, RequestedFields> =>
      t.typeLang === 'ru'
      && (
        (t as sm.TranslationSub).typeKind === 'sub' || (t as sm.TranslationVoice).typeKind === 'voice'
      );


  return apiResponse.data
    .filter(isRuVoiceOrRuSub)
    .map(t => {

      const author = getAuthor({
        summary: t.authorsSummary,
      });

      const qualityType = t.qualityType === 'uncensored' ? 'tv' : t.qualityType;
      const uncensored = t.qualityType === 'uncensored' || (!!t.authorsSummary && /без *ценз|uncensor/i.test(t.authorsSummary));

      return ({
        id: t.id,
        get title() {
          return this.author.team;
        },
        type: t.typeKind,
        author,
        qualityType,
        censored: !uncensored,
      });
    });
}


export async function getStream(translationId: number): Promise<Video | undefined> {
  type ExpectedResponse = sm.Video

  const requestURL = new URL(`translations/embed/${translationId}`, API_BASE);


  const apiResponse = await request<ExpectedResponse>(requestURL);

  if (isFailureResponse(apiResponse)) {
    throw apiResponse.error;
  }

  const {stream, subtitlesUrl} = apiResponse.data;

  if (stream.length === 0) {
    return undefined;
  }

  const tracks: VideoTrack[] = [];

  if (subtitlesUrl) {
    const resolvedSubtitlesUrl = subtitlesUrl.startsWith('http')
      ? subtitlesUrl
      : subtitlesUrl.startsWith('/')
        ? `${HOST_ROOT}${subtitlesUrl}`
        : `${HOST_ROOT}/${subtitlesUrl}`;

    tracks.push({
      src: resolvedSubtitlesUrl,
      srcLang: 'ru',
      label: 'vtt',
      kind: 'subtitles',
      default: true,
    });
  }

  return {
    qualities: new Map(stream.map(s => [s.height, s.urls[0]])),
    tracks,
  };
}


export function clearVideosCache(translationId: number): Promise<boolean> {
  return caches
    .open('sm-api-calls')
    .then(cache => cache.delete(`${API_BASE}translations/embed/${translationId}`, {ignoreSearch: true}));

}


const ACCESS_TOKEN_STORAGE_KEY = 'sm-access-token';


export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}


export function saveAccessToken(token?: string | null): void {
  if (!token) {
    clearAccessToken();
    return;
  }

  const clearedToken = token.trim();
  if (!clearedToken) {
    clearAccessToken();
  }

  return localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, clearedToken);
}


export function clearAccessToken(): void {
  return localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}
