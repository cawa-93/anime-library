import type {Ref} from 'vue';
import {ref, unref, watch} from 'vue';
import {getHistoryItems} from '/@/utils/history-views';
import {useDebounceFn} from '@vueuse/core';
import {searchSeries} from '/@/utils/videoProvider/providers/anime365/anime365';
import {SECOND_MS} from '/@/utils/time';


interface SearchResult {
  id: number;
  title: string;
}


export function useSearchResults(input: Ref<string>): { results: Ref<SearchResult[]>, evaluating: Ref<boolean> } {
  const evaluating = ref(false);
  const results = ref<SearchResult[]>([]);

  const updateResultsDebounced = useDebounceFn(async () => {
    const query = unref(input);

    try {
      if (query !== '') {
        results.value = await getResultsFromSearch(query);
      } else {
        results.value = await getResultsFromHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      evaluating.value = false;
    }

  }, SECOND_MS / 2);

  watch(input, () => {
    results.value = [];
    evaluating.value = true;
    // noinspection JSIgnoredPromiseFromCall
    updateResultsDebounced();
  }, {immediate: true});

  return {results, evaluating};
}


async function getResultsFromSearch(query: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    query,
  });
  const series = await searchSeries(params);
  return series.map(s => ({
    id: s.myAnimeListId,
    title: s.title,
  }));
}


async function getResultsFromHistory(): Promise<SearchResult[]> {
  const history = await getHistoryItems();
  const params = new URLSearchParams([
    ...history.map(i => ['myAnimeListId[]', String(i.seriesId)]),
  ]);

  const response = await searchSeries(params);

  return response.filter(s => {
    const relevantHistoryItem = history.find(i => i.seriesId === s.myAnimeListId);
    // Отфильтровать результаты у которых уже просмотрена последняя серия
    return !(
      relevantHistoryItem
      && relevantHistoryItem.episode.time
      && relevantHistoryItem.episode.duration
      && relevantHistoryItem.episode.number === s.numberOfEpisodes
    );
  }).map(r => ({
    id: r.myAnimeListId,
    title: r.title,
  }));
}
