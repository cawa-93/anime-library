import type {Ref} from 'vue';
import {ref, unref, watch} from 'vue';
import {getHistoryItems} from '/@/utils/history-views';
import {useDebounceFn} from '@vueuse/core';
import {searchSeries} from '/@/utils/videoProvider/providers/anime365/anime365';
import {SECOND_MS} from '/@/utils/time';
import {getSeriesId} from '/@shared/utils/getSeriesId';
import {getSeries} from '/@/utils/videoProvider';


interface SearchResult {
  id: number;
  title: string;
}


export function useSearchResults(input: Ref<string>): { results: Ref<SearchResult[]>, evaluating: Ref<boolean> } {
  const evaluating = ref(false);
  const results = ref<SearchResult[]>([]);

  const updateResultsDebounced = useDebounceFn(async () => {
    const query = unref(input);

    type ResolverFn = (query: string) => SearchResult[] | Promise<SearchResult[]>
    const resolver: ResolverFn = query === ''
      ? getResultsFromHistory
      : query.startsWith('http')
        ? getResultsFromURL
        : getResultsFromSearch;

    try {
      results.value = await resolver(query);
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
  if (history.length === 0) {
    return [];
  }

  const params = new URLSearchParams([
    ...history.map(i => ['myAnimeListId[]', String(i.seriesId)]),
  ]);

  const response = await searchSeries(params);

  if (response.length === 0) {
    return [];
  }

  return history.reduce((accum, item) => {
    const relevantSeries = response.find(s => s.myAnimeListId === item.seriesId);
    if (!relevantSeries) {
      return accum;
    }

    if (item.episode?.time && item.episode?.duration && item.episode?.number === relevantSeries.numberOfEpisodes) {
      return accum;
    }

    accum.push({
      id: relevantSeries.id,
      title: relevantSeries.title,
      // poster: relevantSeries.posterUrlSmall,
    });

    return accum;
  }, [] as SearchResult[]);
}


async function getResultsFromURL(query: string): Promise<SearchResult[]> {
  const id = getSeriesId(query);

  if (!id) return [];

  const series = await getSeries(id);

  if (!series) return [];
  return [{
    id,
    title: series.title,
  }];
}
