import type {Episode, Translation} from '/@/utils/videoProvider';
import {getEpisodes, getTranslations} from '/@/utils/videoProvider';
import {getViewHistoryItem} from '/@/utils/history-views';
import {getPreferredTranslationFromList} from '/@/utils/translationRecommendations/getPreferredTranslationFromList';


function strToNum(str: number | string): number {
  if (typeof str === 'number') {
    return str;
  }

  const num = Number.parseInt(str, 10);
  if (Number.isNaN(num)) {
    throw new Error(`Can't convert "${str}" to number`);
  }

  return num;
}

interface List<T> {
  startItem: T | undefined
  items: T[]
}

export async function getEpisodesList(seriesIdRaw: number | string, episodeNumRaw?: number | string): Promise<List<Episode>> {
  const seriesId = strToNum(seriesIdRaw);
  let episodes: Episode[] = [];
  let startEpisode: Episode | undefined = undefined;

  episodes = await getEpisodes(seriesId);

  if (episodes.length) {
    if (episodeNumRaw !== undefined) {
      const episodeNum = strToNum(episodeNumRaw);
      startEpisode = episodes.find(e => e.number === episodeNum);
    } else {
      const history = await getViewHistoryItem(seriesId);
      if (history !== undefined) {
        startEpisode = episodes.find(e => e.number === history.episode.number);
      }
    }

    if (startEpisode === undefined) {
      startEpisode = episodes[0];
    }
  }

  return {
    items: episodes,
    startItem: startEpisode,
  };
}


export async function getTranslationsList(episodeIdRaw: number | string, seriesIdRaw: number | string, startTranslationIdRaw?: number | string): Promise<List<Translation>> {
  const episodeId = strToNum(episodeIdRaw);
  let translations: Translation[] = [];
  let startTranslation: Translation | undefined = undefined;

  translations = await getTranslations(episodeId);
  if (translations.length) {
    if (startTranslationIdRaw !== undefined) {
      const startTranslationId = strToNum(startTranslationIdRaw);
      startTranslation = translations.find(t => t.id === startTranslationId);
    }

    if (startTranslation === undefined) {
      const seriesId = strToNum(seriesIdRaw);
      startTranslation = await getPreferredTranslationFromList(seriesId, translations as Translation[]);
    }

    if (startTranslation === undefined) {
      startTranslation = translations[0];
    }
  }

  return {
    startItem: startTranslation,
    items: translations,
  };
}
