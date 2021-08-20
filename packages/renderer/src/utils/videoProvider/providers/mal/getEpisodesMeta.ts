import type {MalEpisode, MalResponse} from '/@/utils/videoProvider/providers/mal/malEpisode';
import {deDuplicatedRequest} from '/@/utils/deDuplicatedRequest';


export function getEpisodesMeta(malId: number, episodeNumber: number): Promise<MalEpisode | undefined> {
  const targetPage = Math.floor((episodeNumber - 1) / 100) + 1;
  return deDuplicatedRequest(
    `mal-episode-meta-${malId}-${targetPage}`,
    () => getEpisodesPaginated(malId, targetPage),
  ).then(episodes => {
    if (episodes === undefined) {
      return undefined;
    }

    const targetEpisodeIndex = episodeNumber - (targetPage - 1) * 100 - 1;
    return episodes[targetEpisodeIndex];
  });
}


function getEpisodesPaginated(seriesId: number, page = 1): Promise<MalEpisode[] | undefined> {
  return fetch(`https://api.jikan.moe/v3/anime/${seriesId}/episodes/${page}`)
    .then(r => r.json())
    .then((r: MalResponse) => r.episodes)
    .catch(e => {
      console.error(e);
      return undefined;
    });
}


// async function getEpisodesTitles(seriesId: number, timeout = SECOND_MS * 3): Promise<Map<number, MalEpisode>> {
//   const episodes = new Map<number, MalEpisode>();
//
//   const controller = new AbortController();
//
//   const timeoutId = setTimeout(() => controller.abort(), timeout);
//
//   const firstPage: MalResponse | undefined = await fetch(`https://api.jikan.moe/v3/anime/${seriesId}/episodes/1`, {
//     signal: controller.signal,
//   })
//     .then(r => r.json())
//     .catch(e => {
//       console.error(e);
//       return undefined;
//     });
//
//   clearTimeout(timeoutId);
//
//
//   if (!firstPage?.episodes?.length) {
//     return episodes;
//   }
//
//   firstPage.episodes.forEach(e => episodes.set(e.episode_id, e));
//
//   if (firstPage.episodes_last_page && firstPage.episodes_last_page > 1) {
//     const promises: Promise<MalResponse>[] = [];
//     for (let i = 2; i <= firstPage.episodes_last_page; i++) {
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), timeout);
//       promises.push(
//         fetch(`https://api.jikan.moe/v3/anime/${seriesId}/episodes/${i}`, {signal: controller.signal})
//           .then(r => r.json())
//           .finally(() => clearTimeout(timeoutId)),
//       );
//     }
//
//     const responses = await Promise.allSettled(promises);
//     responses.forEach(response => {
//       if (response.status === 'fulfilled' && response.value.episodes && response.value.episodes.length) {
//         response.value.episodes.forEach(e => episodes.set(e.episode_id, e));
//       }
//     });
//   }
//
//   return episodes;
// }
