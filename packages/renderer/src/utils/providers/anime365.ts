import type {Episode, Series, Translation, Video} from '/@/utils/ProviderInterfaces';
import type * as provided from '/@/utils/providers/anime365-interfaces';
import type {ApiResponse, ApiResponseFailure, ApiResponseSuccess} from '/@/utils/providers/anime365-interfaces';


const API_BASE = 'https://smotret-anime.online/api/';

async function request<T>(url: string | URL): Promise<ApiResponse<T>> {

  if (!(url instanceof URL)) {
    url = new URL(url);
  }

  if (import.meta.env.VITE_SM_ACCESS_TOKEN) {
    url.searchParams.set('access_token', import.meta.env.VITE_SM_ACCESS_TOKEN);
  }

  const response = await fetch(String(url));
  if (!response.ok) {
    throw await response.text();
  }

  return await response.json();
}

function isFailureResponse(response: ApiResponseFailure | ApiResponseSuccess<unknown>): response is ApiResponseFailure {
  return (response as ApiResponseSuccess<unknown>).data === undefined;
}

export async function searchSeries<RequestedFields extends keyof provided.Series>(searchParams: URLSearchParams): Promise<Pick<provided.Series, RequestedFields>[]> {
  const requestURL = new URL('series', API_BASE);
  searchParams.forEach((v, k) => requestURL.searchParams.set(k, v));

  requestURL.searchParams.set('isActive', '1');

  const apiResponse = await request<Pick<provided.Series, RequestedFields>[]>(requestURL);

  if (isFailureResponse(apiResponse)) {
    throw apiResponse.error;
  }

  return apiResponse.data;
}

export async function getSeries(myAnimeListId: NumberLike): Promise<Series | undefined> {
  const fields = ['title', 'myAnimeListId'] as const;
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
    title: targetSeries.title,
  };
}


export async function getEpisodes(myAnimeListId: NumberLike): Promise<Episode[]> {
  const fields = ['episodes', 'numberOfEpisodes'] as const;
  type RequestedFields = typeof fields[number]

  const searchParams = new URLSearchParams({
    fields: fields.join(','),
    myAnimeListId: String(myAnimeListId),
  });

  const searchResult = await searchSeries<RequestedFields>(searchParams);

  const targetSeries = searchResult[0];
  if (searchResult.length > 1) {
    // TODO: Доработать алгоритм точного совпадения по myAnimeListId
    console.error(
      `По запросу {myAnimeListId: ${myAnimeListId}} было возвращено больше одного результата! Результатов возвращено: ${searchResult.length}`,
      {searchResult},
    );
  }

  return (targetSeries.episodes || [])
    .filter(e =>
      e.isActive === 1

      // Удалять серии у которых number > Чем заявлено в сезоне
      // Обычно такие серии залиты по ошибке
      && parseFloat(e.episodeInt) <= targetSeries.numberOfEpisodes,
    )
    .map(e => ({
      id: e.id,
      title: e.episodeTitle || e.episodeFull,
      number: parseFloat(e.episodeInt),
    }));
}


export async function getTranslations(episodeId: NumberLike): Promise<Translation[]> {
  const fields = ['id', 'authorsSummary', 'episodeId', 'typeKind'] as const;
  type RequestedFields = typeof fields[number]
  type ExpectedResponse = Array<Pick<provided.Translation, RequestedFields>>

  const requestURL = new URL('translations', API_BASE);

  requestURL.searchParams.set('fields', fields.join(','));
  requestURL.searchParams.set('isActive', '1');
  requestURL.searchParams.set('episodeId', String(episodeId));
  requestURL.searchParams.set('typeKind', 'voice,sub');

  const apiResponse = await request<ExpectedResponse>(requestURL);

  if (isFailureResponse(apiResponse)) {
    throw apiResponse.error;
  }

  const isVoiceOrSub =
    (t: ExpectedResponse[number]):
      t is Pick<provided.TranslationSub, RequestedFields> | Pick<provided.TranslationVoice, RequestedFields> =>
      (t as provided.TranslationSub).typeKind === 'sub' || (t as provided.TranslationVoice).typeKind === 'voice';

  return apiResponse.data
    .filter(isVoiceOrSub)
    .map(t => ({
      id: t.id,
      title: t.authorsSummary || 'Неизвестный',
      type: t.typeKind,
    }));
}


export async function getStream(translationId: NumberLike): Promise<Video> {
  type ExpectedResponse = provided.Video

  const requestURL = new URL(`translations/embed/${translationId}`, API_BASE);


  const apiResponse = await request<ExpectedResponse>(requestURL);

  if (isFailureResponse(apiResponse)) {
    throw apiResponse.error;
  }

  if (apiResponse.data.stream.length === 0) {
    throw new Error(`У {translationId: ${translationId}} нет доступных видео`);
  }

  return {
    quality: apiResponse.data.stream[0].height,
    url: apiResponse.data.stream[0].urls[0],
  };
}
