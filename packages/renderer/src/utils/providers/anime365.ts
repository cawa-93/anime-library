import type {Episode, Series} from '/@/utils/ProviderInterfaces';
import type * as provided from '/@/utils/providers/anime365-interfaces';
import type {ApiResponse, ApiResponseFailure, ApiResponseSuccess} from '/@/utils/providers/anime365-interfaces';


const API_BASE = 'https://smotret-anime.online/api/';

async function request<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
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

  const apiResponse = await request<Pick<provided.Series, RequestedFields>[]>(String(requestURL));

  // const isFailure = ;
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
