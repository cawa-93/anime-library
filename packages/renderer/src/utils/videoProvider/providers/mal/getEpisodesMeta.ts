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

    // Выполнить быстрый поиск по индексу
    // Обычно номер эпизода соответствует индексу в массиве
    // Что позволяет найти нужный элемент очень быстро не прибегая к перебору
    const targetEpisodeIndex = episodeNumber - (targetPage - 1) * 100 - 1;
    let targetEpisode: MalEpisode | undefined = episodes[targetEpisodeIndex];

    // Если эпизод найденный по индексу не соответствует запрошенныму
    // Выполнить поиск перебором
    if (targetEpisode?.episode_id !== episodeNumber) {
      targetEpisode = episodes.find(e => e.episode_id === episodeNumber);
    }

    // Если у загруженного эпизода название в шаблоне "Episode 1"
    // Удалить это название будто его вовсе нет.
    // Это нужно для того чтобы вместо английских названий "Episode 1" отображалить русские "Серия 1"
    if (targetEpisode?.title && /^Episode\.?\s+\d+$/.test(targetEpisode?.title)) {
      delete targetEpisode.title;
    }

    return targetEpisode;
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
