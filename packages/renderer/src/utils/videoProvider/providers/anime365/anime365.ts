import type * as sm from '/@/utils/videoProvider/providers/anime365/anime365-interfaces';
import type {Episode, Translation, Video, VideoTrack} from '/@/utils/videoProvider';
import {getAuthor} from '/@/utils/videoProvider/providers/anime365/anime365-authors';
import {resolveEpisodesList} from '/@/utils/videoProvider/providers/anime365/resolveEpisodesList';
import {API_BASE, ANIME365_ORIGIN, isFailureResponse, request} from '/@/utils/videoProvider/providers/anime365/utils';
import {searchSeries} from '/@/utils/videoProvider/providers/anime365/series';
import type {
  TranslationRaw,
  TranslationSub,
  TranslationVoice,
} from '/@/utils/videoProvider/providers/anime365/anime365-interfaces';


export async function getEpisodes(myAnimeListId: number | string): Promise<Episode[]> {
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

  return resolveEpisodesList(targetSeries);
}


// export async function getTranslations(episodeId: number | string): Promise<Translation[]> {
//   const fields = ['id', 'authorsSummary', 'authorsList', 'episodeId', 'typeKind', 'typeLang', 'isActive', 'qualityType'] as const;
//   type RequestedFields = typeof fields[number]
//   type ResponseItem = Pick<sm.Translation, RequestedFields>
//   type ExpectedResponse = Array<ResponseItem>
//
//   const requestURL = new URL('translations', API_BASE);
//
//   requestURL.searchParams.set('fields', fields.join(','));
//   requestURL.searchParams.set('isActive', '1');
//   requestURL.searchParams.set('limit', '0');
//   requestURL.searchParams.set('episodeId', String(episodeId));
//
//   // Отфильтровать не нужные переводы
//   requestURL.searchParams.append('type[]', 'voiceRu');
//   requestURL.searchParams.append('type[]', 'subRu');
//
//   const apiResponse = await request<ExpectedResponse>(requestURL);
//
//   if (isFailureResponse(apiResponse)) {
//     throw apiResponse.error;
//   }
//
//   const isRuVoiceOrRuSub =
//     (t: ResponseItem):
//       t is Pick<sm.TranslationSub, RequestedFields> | Pick<sm.TranslationVoice, RequestedFields> =>
//       t.typeLang === 'ru'
//       && (
//         (t as sm.TranslationSub).typeKind === 'sub' || (t as sm.TranslationVoice).typeKind === 'voice'
//       );
//
//
//   return apiResponse.data
//     .filter(isRuVoiceOrRuSub)
//     .map(t => {
//
//       const author = getAuthor({
//         summary: t.authorsSummary,
//       });
//
//       const qualityType = t.qualityType === 'uncensored' ? 'tv' : t.qualityType;
//       const uncensored = t.qualityType === 'uncensored' || (!!t.authorsSummary && /без *ценз|uncensor/i.test(t.authorsSummary));
//
//       return ({
//         id: t.id,
//         get title() {
//           return this.author.team;
//         },
//         type: t.typeKind,
//         author,
//         qualityType,
//         censored: !uncensored,
//       });
//     });
// }

/**
 * HOTFIX
 * Альтернативный способ загрузки переводов
 * @param episodeId
 * @see https://github.com/cawa-93/anime-library/issues/311
 */
export async function getTranslations(episodeId: number | string): Promise<Translation[]> {
  const fields = ['translations'] as const;
  type RequestedFields = typeof fields[number]
  type ExpectedResponse = Pick<sm.Episode, RequestedFields>
  type ResponseItem = TranslationVoice | TranslationSub | TranslationRaw

  const requestURL = new URL(`episodes/${episodeId}`, API_BASE);

  requestURL.searchParams.set('fields', fields.join(','));
  // requestURL.searchParams.set('isActive', '1');
  // requestURL.searchParams.set('limit', '0');
  // requestURL.searchParams.set('episodeId', String(episodeId));

  // Отфильтровать не нужные переводы
  // requestURL.searchParams.append('type[]', 'voiceRu');
  // requestURL.searchParams.append('type[]', 'subRu');

  const apiResponse = await request<ExpectedResponse>(requestURL);

  if (isFailureResponse(apiResponse)) {
    throw apiResponse.error;
  }

  if (!apiResponse.data?.translations?.length) {
    return [];
  }

  const isRuVoiceOrRuSub =
    (t: ResponseItem):
      t is TranslationVoice | TranslationSub =>
      t.typeLang === 'ru'
      && (
        (t as sm.TranslationSub).typeKind === 'sub' || (t as sm.TranslationVoice).typeKind === 'voice'
      );


  return apiResponse.data.translations
    .filter(isRuVoiceOrRuSub)
    .filter(t => t.isActive === 1)
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
        maxQuality: t.height,
      });
    });
}


export async function getStream(translationId: number | string, access_token?: string | null, options?: RequestInit): Promise<Video | undefined> {
  type ExpectedResponse = sm.Video

  const requestURL = new URL(`translations/embed/${translationId}`, API_BASE);


  const apiResponse = await request<ExpectedResponse>(requestURL, access_token, options);

  if (isFailureResponse(apiResponse)) {
    throw apiResponse;
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
        ? `${ANIME365_ORIGIN}${subtitlesUrl}`
        : `${ANIME365_ORIGIN}/${subtitlesUrl}`;

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


export function clearVideosCache(translationId: number | string): Promise<boolean> {
  return caches
    .open('sm-api-calls')
    .then(cache => cache.delete(`${API_BASE}translations/embed/${translationId}`, {ignoreSearch: true}));

}


export const ACCESS_TOKEN_STORAGE_KEY = 'sm-access-token';


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
