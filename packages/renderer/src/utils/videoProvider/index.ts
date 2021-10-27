import * as provider from '/@/utils/videoProvider/providers/anime365/anime365';
import {deDuplicatedRequest} from '/@/utils/deDuplicatedRequest';
import {getEpisodesMeta} from '/@/utils/videoProvider/providers/mal/getEpisodesMeta';
import {
  getSeries as providerGetSeries,
  getSeriesByQuery as providerGetSeriesByQuery,
} from '/@/utils/videoProvider/providers/anime365/series';


interface HasID {
  id: number;
}


interface HasTitle {
  title: string;
}


export interface Series extends HasID, HasTitle {
  poster?: string;

  /**
   * Количество заявленных эпизодов.
   * 0 -- Если количество эпизодов не известно
   */
  numberOfEpisodes: number;

  /**
   * Тип аниме
   */
  kind: 'tv' | 'movie' | 'ova' | 'ona' | 'special' | 'music';

  /**
   * Год выхода аниме.
   * 0 -- Если аниме ещё не вышло или год не известен
   */
  year: number;
}


export interface Episode extends HasID, HasTitle {
  /**
   * Порядковый номер эпизода в сериале
   */
  number: number;
  recap?: boolean;
  filler?: boolean;
}


export type TranslationType = 'sub' | 'voice'


export interface Translation extends HasID, HasTitle {
  /**
   * Тип перевода: Озвучка или субтитры
   */
  type: TranslationType;

  /**
   * Автор перевода
   */
  author: TranslationAuthor;

  /**
   * Тип источника видео
   */
  qualityType: 'bd' | 'dvd' | 'tv';

  /**
   * Есть ли в видео цензура
   */
  censored: boolean;

  /**
   * Максимальное доступное качество
   */
  maxQuality: number
}


export interface VideoTrack {
  src: string,
  srcLang: string,
  kind: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  label: string,
  default?: boolean
}


export interface Video {
  qualities: Map<number, string>,
  tracks?: VideoTrack[]
}


export interface TranslationAuthor {
  readonly id: string | null;
  readonly team: string;
  readonly members: string[];
}


/**
 * Возвращает {@link Series} по его MyAnimeListID
 */
export function getSeries(malId: number): Promise<Series | undefined>
export function getSeries(malId: number[]): Promise<Series[]>
export function getSeries(malId: number | number[]): Promise<Series | Series[] | undefined> {
  return deDuplicatedRequest<Series | Series[] | undefined>(
    `series-${malId}`,
    /**
     * Костыль для исправления ошибки TS
     * @see https://qna.habr.com/q/1058108
     */
    () => typeof malId === 'number' ? providerGetSeries(malId) : providerGetSeries(malId),
  );
}


export function getSeriesByQuery(query: string, limit?: number): Promise<Series[]> {
  return deDuplicatedRequest(
    `series-${query}${limit}`,
    () => providerGetSeriesByQuery(query, limit),
  );
}


/**
 * Возвращает массив {@link Episode} относящихся к аниме
 */
export function getEpisodes(malId: number | string): Promise<Episode[]> {
  return deDuplicatedRequest(
    `episodes-${malId}`,
    () => provider.getEpisodes(malId),
  );
}


/**
 * Возвращает массив переводов относящихся к конкретной серии
 * @param providerEpisodeId ID Серии полученный от конкретного видео-провайдера
 */
export function getTranslations(providerEpisodeId: number | string): Promise<Translation[]> {
  return deDuplicatedRequest(
    `translations-${providerEpisodeId}`,
    () => provider.getTranslations(providerEpisodeId),
  );
}


/**
 * Возвращает массив видео для конкретного перевода
 */
export function getVideo(providerTranslationId: number | string): Promise<Video | undefined> {
  return deDuplicatedRequest(
    `videos-${providerTranslationId}`,
    () => provider.getStream(providerTranslationId),
  );
}


/**
 * Удаляет кэш видео для конкретного перевода
 */
export function clearVideosCache(providerTranslationId: number | string): Promise<boolean> {
  return provider.clearVideosCache(providerTranslationId);
}


export function getEpisodeMeta(malId: number, episodeNumber: number): Promise<{
  title?: string
  filler: boolean,
  recap: boolean,
  episode_id: number,
} | undefined> {
  return deDuplicatedRequest(
    `episodes-meta-${malId}-${episodeNumber}`,
    () => getEpisodesMeta(malId, episodeNumber),
  );
}
