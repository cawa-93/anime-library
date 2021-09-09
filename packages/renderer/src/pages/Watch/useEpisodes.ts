import type {Ref} from 'vue';
import type {Episode} from '/@/utils/videoProvider';
import {getEpisodes} from '/@/utils/videoProvider';
import {getViewHistoryItem} from '/@/utils/history-views';
import {asyncComputed} from '@vueuse/core';
import {computed, ref, unref, watch} from 'vue';

type useEpisodesReturn = {
  readonly episodes: Ref<Episode[]>,
  readonly selectedEpisode: Ref<Episode | undefined>,
  readonly nextEpisode: Ref<Episode | undefined>,
  readonly selectEpisode: (num: number) => void,
  readonly selectNextEpisode: () => void,
  readonly isEvaluating: Ref<boolean>,
}

export function useEpisodes(seriesId: Ref<number | string>, episodeNumRaw?: number | string): useEpisodesReturn {
  const evaluating = ref(true);
  const $episodes = asyncComputed(() => getEpisodes(unref(seriesId)), [], {evaluating});

  const $selectedEpisodeIndex = ref<number>(-1);

  /**
   * Переключает выбранную серию по порядковому номеру
   * @param num
   */
  const selectEpisode = (num: number) => {
    if ($episodes.value && $episodes.value.length > 0) {
      $selectedEpisodeIndex.value = $episodes.value.findIndex((e: Episode) => e.number === num);
    }
  };


  watch($episodes, async episodes => {
    if (episodes.length) {
      /**
       * Порядковый номер серии которую нужно выбрать
       */
      const targetEpisodeNum = episodeNumRaw
        ? Number(episodeNumRaw)
        : await getViewHistoryItem(Number(seriesId.value)).then(h => h?.episode?.number);

      targetEpisodeNum ? selectEpisode(targetEpisodeNum) : $selectedEpisodeIndex.value = 0;
    }
  });

  const $selectedEpisode = computed<Episode | undefined>({
    get() {
      return $selectedEpisodeIndex.value !== undefined
        ? $episodes.value[$selectedEpisodeIndex.value]
        : undefined;
    },
    set(value) {
      selectEpisode(value?.number || -1);
    },
  });
  const $nextEpisode = computed(() => $selectedEpisodeIndex.value !== undefined
    ? $episodes.value[$selectedEpisodeIndex.value + 1]
    : undefined);


  /**
   * Переключает выбранную серию на следующую если такая есть
   */
  const selectNextEpisode = () => {
    if ($nextEpisode.value !== undefined && $selectedEpisodeIndex.value !== undefined) {
      $selectedEpisodeIndex.value += 1;
    }
  };

  return {
    episodes: $episodes,
    selectedEpisode: $selectedEpisode,
    nextEpisode: $nextEpisode,
    selectEpisode,
    selectNextEpisode,
    isEvaluating: evaluating as Readonly<Ref<boolean>>,
  };
}
