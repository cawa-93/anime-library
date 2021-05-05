import {
  getEpisodes as providerGetEpisodes,
  getSeries as providerGetSeries,
  getStream as providerGetStream,
  getTranslations as providerGetTranslations,
} from '/@/utils/providers/anime365';

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

export interface Video {
  quality: number
  url: string
}

export function getSeries(id: NumberLike): Promise<Series | undefined> {
  return providerGetSeries(id);
}

export function getEpisodes(id: NumberLike): Promise<Episode[]> {
  return providerGetEpisodes(id);
}


export function getTranslations(providerEpisodeId: NumberLike): Promise<Translation[]> {
  return providerGetTranslations(providerEpisodeId);
}


export function getVideos(providerTranslationId: NumberLike): Promise<Video[]> {
  return providerGetStream(providerTranslationId).then(s => ([s]));
}
