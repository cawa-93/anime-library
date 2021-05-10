import * as provider from '/@/utils/videoProvider/providers/anime365';

interface HasID {
  id: NumberLike
}

interface HasTitle {
  title: string
}


export interface Series extends HasID, HasTitle {
}

export interface Episode extends HasID, HasTitle {
  /**
   * Порядковый номер эпизода в сериале
   */
  number: number
}

export type TranslationType = 'sub' | 'voice'

export interface Translation extends HasID, HasTitle {
  /**
   * Тип перевода: Озвучка или субтитры
   */
  type: TranslationType
}

export interface VideoSource {
  src: string,
  type?: string
}

export interface VideoTrack {
  src: string,
  srcLang: string,
  kind: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  label: string,
  default?: boolean
}

export interface Video {
  quality: number,
  sources: VideoSource[]
  tracks?: VideoTrack[]
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requestsCache = new Map<string, Promise<any>>();

/**
 * Не позволяет выполнять последовательно несколько идентичных запросов
 */
function deDuplicatedRequest<T>(requestId: string, request: () => Promise<T>): Promise<T> {
  let savedRequest = requestsCache.get(requestId);
  if (savedRequest) {
    return savedRequest;
  }
  savedRequest = request().finally(() => requestsCache.delete(requestId));
  requestsCache.set(requestId, savedRequest);
  return savedRequest;
}


/**
 * Возвращает {@link Series} по его MyAnimeListID
 */
export function getSeries(malId: NumberLike): Promise<Series | undefined> {
  return deDuplicatedRequest(`series-${malId}`, () => provider.getSeries(malId));
}


/**
 * Возвращает массив {@link Episode} относящихся к аниме
 */
export function getEpisodes(malId: NumberLike): Promise<Episode[]> {
  return deDuplicatedRequest(`episodes-${malId}`, () => provider.getEpisodes(malId));
}


/**
 * Возвращает массив переводов относящихся к конкретной серии
 * @param providerEpisodeId ID Серии полученный от конкретного видео-провайдера
 */
export function getTranslations(providerEpisodeId: NumberLike): Promise<Translation[]> {
  return deDuplicatedRequest(`translations-${providerEpisodeId}`, () => provider.getTranslations(providerEpisodeId));
}


/**
 * Возвращает массив видео для конкретного перевода
 */
export function getVideos(providerTranslationId: NumberLike): Promise<Video[]> {
  return deDuplicatedRequest(`videos-${providerTranslationId}`, () => provider.getStream(providerTranslationId));
}


/**
 * Удаляет кэш видео для конкретного перевода
 */
export function clearVideosCache(providerTranslationId: NumberLike): Promise<boolean> {
  return provider.clearVideosCache(providerTranslationId);
}

