import {readonly} from 'vue';
import * as provider from '/@/utils/videoProvider/providers/anime365';
import {deDuplicatedRequest} from '/@/utils/deDuplicatedRequest';


interface HasID {
  id: number
}

interface HasTitle {
  title: string
}


export interface Series extends HasID, HasTitle {
  poster?: string
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

  /**
   * Автор перевода
   */
  author: TranslationAuthor

  qualityType: 'bd' | 'dvd' | 'tv'
  censored: boolean
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

export interface TranslationAuthor {
  readonly id: string | null
  readonly team: string
  readonly members: string[]
}


/**
 * Возвращает {@link Series} по его MyAnimeListID
 */
export function getSeries(malId: number): Promise<Series | undefined> {
  return deDuplicatedRequest(
    `series-${malId}`,
    () => provider.getSeries(malId).then(s => s === undefined ? s : readonly(s)),
  );
}


/**
 * Возвращает массив {@link Episode} относящихся к аниме
 */
export function getEpisodes(malId: number): Promise<Episode[]> {
  return deDuplicatedRequest(
    `episodes-${malId}`,
    () => provider.getEpisodes(malId),
  );
}


/**
 * Возвращает массив переводов относящихся к конкретной серии
 * @param providerEpisodeId ID Серии полученный от конкретного видео-провайдера
 */
export function getTranslations(providerEpisodeId: number): Promise<Translation[]> {
  return deDuplicatedRequest(
    `translations-${providerEpisodeId}`,
    () => provider.getTranslations(providerEpisodeId),
  );
}


/**
 * Возвращает массив видео для конкретного перевода
 */
export function getVideos(providerTranslationId: number): Promise<Video[]> {
  return deDuplicatedRequest(
    `videos-${providerTranslationId}`,
    () => provider.getStream(providerTranslationId),
  );
}


/**
 * Удаляет кэш видео для конкретного перевода
 */
export function clearVideosCache(providerTranslationId: number): Promise<boolean> {
  return provider.clearVideosCache(providerTranslationId);
}

