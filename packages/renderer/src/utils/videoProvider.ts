import {
  getEpisodes as providerGetEpisodes,
  getSeries as providerGetSeries,
  getTranslations as providerGetTranslations,
} from '/@/utils/providers/anime365';
import type {Episode, Series, Translation} from '/@/utils/ProviderInterfaces';

export function getSeries(id: NumberLike): Promise<Series | undefined> {
  return providerGetSeries(id);
}

export function getEpisodes(id: NumberLike): Promise<Episode[]> {
  return providerGetEpisodes(id);
}


export function getTranslations(providerEpisodeId: NumberLike): Promise<Translation[]> {
  return providerGetTranslations(providerEpisodeId);
}


// // https://smotret-anime.online/api/translations/embed/2423373
// export function getVideos(id: NumberLike): Promise<Video[]> {
//   return fetch(`${API_BASE}/translations/embed/${id}?&access_token=${import.meta.env.VITE_SM_ACCESS_TOKEN}`)
//     .then(r => r.json())
//     .then(({data}: { data: any }) => {
//       return data.stream.map((e: any) => ({height: e.height, url: e.urls[0]}));
//     });
// }
