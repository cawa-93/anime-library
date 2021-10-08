import type * as sm from '/@/utils/videoProvider/providers/anime365/anime365-interfaces';
import {API_BASE, isFailureResponse, request} from '/@/utils/videoProvider/providers/anime365/utils';
import {getLang} from '/@/pages/Options/OptionsAnimeTitleLang/OptionsAnimeTitleLangController';
import type {Series} from '/@/utils/videoProvider';


const SERIES_FIELDS = ['titles', 'myAnimeListId', 'posterUrl', 'numberOfEpisodes'] as const;
type RequestedFields = typeof SERIES_FIELDS[number]


export async function searchSeries<RequestedFields extends keyof sm.Series>(
  searchParams: URLSearchParams,
  options?: RequestInit,
): Promise<Pick<sm.Series, RequestedFields>[]> {
  const requestURL = new URL('series?' + searchParams, API_BASE);

  requestURL.searchParams.set('isActive', '1');

  const apiResponse = await request<Pick<sm.Series, RequestedFields>[]>(requestURL, undefined, options);

  if (isFailureResponse(apiResponse)) {
    throw apiResponse;
  }

  return apiResponse.data;
}


function resolveSeries(targetSeries: Pick<sm.Series, RequestedFields>): Series {
  const {titles} = targetSeries;
  const resolvedTitle = (getLang() === 'ru'
    ? titles.ru
    : titles.romaji) || titles.ru || titles.romaji || titles.en || titles.ja || '';

  return {
    id: targetSeries.myAnimeListId,
    title: resolvedTitle,
    poster: targetSeries.posterUrl,
    numberOfEpisodes: targetSeries.numberOfEpisodes,
  };
}


export function getSeries(myAnimeListId: number): Promise<Series | undefined>
export function getSeries(myAnimeListId: number[]): Promise<Series[]>
export async function getSeries(myAnimeListId: number | number[]): Promise<Series | Series[] | undefined> {

  const isMultipleIds = Array.isArray(myAnimeListId);

  const searchParams = new URLSearchParams(
    (isMultipleIds ? myAnimeListId : [myAnimeListId]).map(i => ['myAnimeListId[]', String(i)]),
  );

  searchParams.append('fields', SERIES_FIELDS.join(','));

  const searchResult = await searchSeries<RequestedFields>(searchParams);

  if (searchResult.length === 0) {
    return isMultipleIds ? [] : undefined;
  }

  return isMultipleIds ? searchResult.map(resolveSeries) : resolveSeries(searchResult[0]);
}


export async function getSeriesByQuery(query: string, limit = 10): Promise<Series[]> {
  const params = new URLSearchParams({
    query,
    limit: String(limit),
    fields: SERIES_FIELDS.join(','),
  });
  const series = await searchSeries(params);
  return series.map(resolveSeries);
}
