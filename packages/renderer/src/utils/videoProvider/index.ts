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

export interface Video {
  qualities: {
    [size: number]: string,
  }
  url: string
}

export function getSeries(id: NumberLike): Promise<Series | undefined> {
  return provider.getSeries(id);
}

export function getEpisodes(id: NumberLike): Promise<Episode[]> {
  return provider.getEpisodes(id);
}


export function getTranslations(providerEpisodeId: NumberLike): Promise<Translation[]> {
  return provider.getTranslations(providerEpisodeId);
}


export function getVideos(providerTranslationId: NumberLike): Promise<Video[]> {
  return provider.getStream(providerTranslationId).then(s => ([s]));
}
