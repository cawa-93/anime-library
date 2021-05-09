import type * as sm from '/@/utils/videoProvider/providers/anime365-interfaces';
import type {Episode, Series, Translation, Video} from '/@/utils/videoProvider';


const API_BASE = 'https://smotret-anime.online/api/';

async function request<T>(url: string | URL): Promise<sm.ApiResponse<T>> {

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

function isFailureResponse(response: sm.ApiResponseFailure | sm.ApiResponseSuccess<unknown>): response is sm.ApiResponseFailure {
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
  const fields = ['episodes', 'numberOfEpisodes', 'type'] as const;
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

      && e.episodeType === targetSeries.type

      // Удалять серии у которых number > Чем заявлено в сезоне
      // Обычно такие серии залиты по ошибке
      && (
        parseFloat(e.episodeInt) === 0
        || targetSeries.numberOfEpisodes >= parseFloat(e.episodeInt)
      ),
    )
    .map(e => ({
      id: e.id,
      title: e.episodeTitle || e.episodeFull,
      number: parseFloat(e.episodeInt),
    }));
}


export async function getTranslations(episodeId: NumberLike): Promise<Translation[]> {
  const fields = ['id', 'authorsSummary', 'episodeId', 'typeKind', 'typeLang', 'isActive'] as const;
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
    .map(t => ({
      id: t.id,
      title: t.authorsSummary || 'Неизвестный',
      type: t.typeKind,
    }));
}


export async function getStream(translationId: NumberLike): Promise<Video> {
  type ExpectedResponse = sm.Video

  const requestURL = new URL(`translations/embed/${translationId}`, API_BASE);


  const apiResponse = await request<ExpectedResponse>(requestURL);

  if (isFailureResponse(apiResponse)) {
    throw apiResponse.error;
  }


  const streams = apiResponse.data.stream
    .flatMap(s => s.urls.map(u => ({size: s.height, url: u})))
    .sort((s1, s2) => s2.size - s1.size);

  if (streams.length === 0) {
    throw new Error(`У {translationId: ${translationId}} нет доступных видео`);
  }

  // TODO: Продумать лучший механизм для выбора видео потока
  const url = streams[0].url;

  const qualities: Video['qualities'] = {};
  for (const stream of streams) {
    qualities[stream.size] = stream.url;
  }

  return {
    url,
    qualities,
  };
}
