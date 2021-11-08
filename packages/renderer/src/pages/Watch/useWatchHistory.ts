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
    .then(item => historyItem.value = item || null)
    .catch(console.error);


  const saveProgressDebounced = useDebounceFn((historyItem) => {
    return putHistoryItem(historyItem).catch(console.error);
  }, SECOND_MS);


  const computedByKey = (key: keyof HistoryViewsItem['episode'], defaultValue: number) => ({
    get() {
      return historyItem.value && selectedEpisodeNumber.value
        ? (
          historyItem.value.episode[key] && historyItem.value.episode.number === selectedEpisodeNumber.value
            ? historyItem.value.episode[key] || defaultValue
            : defaultValue
        )
        : defaultValue;
    },
    set(value: number) {
      if (historyItem.value !== null) {
        if (historyItem.value.episode[key] !== value) {
          historyItem.value.episode[key] = value;
        }

      } else if (selectedEpisodeNumber.value) {
        historyItem.value = {
          seriesId: Number(seriesId),
          episode: {
            number: selectedEpisodeNumber.value,
            time: 0,
            duration: 0,
          },
        };
      }

      if (historyItem.value) {
        saveProgressDebounced(toRaw(historyItem.value));//.then(debRes => console.log({debRes}));
      }
    },
  });


  const currentTime = computed(computedByKey('time', 0));
  const duration = computed(computedByKey('duration', 0));

  watch(selectedEpisodeNumber, (currNumber) => {
    if (!historyItem.value) {
      return;
    }

    if (currNumber && historyItem.value.episode.number !== currNumber) {
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
