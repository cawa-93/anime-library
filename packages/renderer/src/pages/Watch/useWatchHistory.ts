import type {Ref} from 'vue';
import {computed, ref, toRaw, watch} from 'vue';
import type {HistoryViewsItem} from '/@/utils/history-views';
import {getViewHistoryItem, putHistoryItem} from '/@/utils/history-views';
import {useDebounceFn} from '@vueuse/core';
import {SECOND_MS} from '/@/utils/time';


export function useWatchHistory(
  seriesId: number | string,
  selectedEpisodeNumber: Ref<number | undefined | null>,
): { currentTime: Ref<number>; duration: Ref<number> } {

  const historyItem = ref<HistoryViewsItem | null>(null);

  getViewHistoryItem(Number(seriesId), false)
    .then(item => {
      historyItem.value = item || null;
    })
    .catch(console.error);


  const saveProgressDebounced = useDebounceFn((historyItem) => {
    putHistoryItem(historyItem).catch(console.error);
  }, SECOND_MS);

  const getByKey =
    <K extends keyof HistoryViewsItem['episode']>(k: K, defaultValue: number) =>
      computed<number>({
        get() {
          return historyItem.value && selectedEpisodeNumber.value
            ? (
              historyItem.value.episode[k] && historyItem.value.episode.number === selectedEpisodeNumber.value
                ? historyItem.value.episode[k] || defaultValue
                : defaultValue
            )
            : defaultValue;
        },
        set(value: number) {
          if (!historyItem.value?.episode || historyItem.value.episode[k] === value) {
            return;
          }
          historyItem.value.episode[k] = value;

          saveProgressDebounced(toRaw(historyItem.value));
        },
      });

  const currentTime = getByKey('time', 0);
  const duration = getByKey('duration', 0);

  watch(selectedEpisodeNumber, (currNumber, prevNumber) => {
    if (!historyItem.value) {
      return;
    }

    if (currNumber && prevNumber && currNumber !== prevNumber) {
      historyItem.value.episode.number = currNumber;
      currentTime.value = 0;
      duration.value = 0;
    }
  });

  return {
    currentTime,
    duration,
  };
}
