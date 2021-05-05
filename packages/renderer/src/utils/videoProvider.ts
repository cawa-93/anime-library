import {
  getEpisodes as providerGetEpisodes,
  getSeries as providerGetSeries,
  getStream,
  getTranslations as providerGetTranslations,
} from '/@/utils/providers/anime365';
import type {Episode, Series, Translation, Video} from '/@/utils/ProviderInterfaces';

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
  return getStream(providerTranslationId).then(s => ([s]));
}
