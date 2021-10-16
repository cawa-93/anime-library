import type {Ref} from 'vue';
import {ref, unref, watch} from 'vue';
import {getHistoryItems} from '/@/utils/history-views';
import {useDebounceFn} from '@vueuse/core';
import {SECOND_MS} from '/@/utils/time';
import {getSeriesId} from '/@shared/utils/getSeriesId';
import type {Series} from '/@/utils/videoProvider';
import {getSeries, getSeriesByQuery} from '/@/utils/videoProvider';


const resultsCache = new Map<string, Series[]>();


export function useSearchResults(input: Ref<string>): { results: Ref<Series[]>, evaluating: Ref<boolean> } {
  const evaluating = ref(false);

  const results = ref(resultsCache.get(unref(input)) || []);

  const updateResultsDebounced = useDebounceFn<() => void>(async () => {
    const query = unref(input);

    type ResolverFn = (query: string) => Series[] | Promise<Series[]>
    const resolver: ResolverFn = query === ''
      ? getResultsFromHistory
      : query.startsWith('http')
        ? getResultsFromURL
        : getResultsFromSearch;

    try {
      results.value = await resolver(query);
      resultsCache.set(query, results.value);
    } catch (e) {
      console.error(e);
    } finally {
      evaluating.value = false;
    }

  }, SECOND_MS / 3);



  watch(input, (query) => {
    const cached = resultsCache.get(query);

    if (cached !== undefined) {
      results.value = cached;
      return;
    }

    results.value = [];
    evaluating.value = true;
    updateResultsDebounced();
  }, {immediate: true});

  return {results, evaluating};
}


function getResultsFromSearch(query: string): Promise<Series[]> {
  return getSeriesByQuery(query);
}


async function getResultsFromHistory(): Promise<Series[]> {
  const history = await getHistoryItems();
  if (history.length === 0) {
    return [];
  }


  const targetIds = history.map(i => i.seriesId);
  const response = await getSeries(targetIds);

  if (response.length === 0) {
    return [];
  }

  return history.reduce((accum, item) => {
    const relevantSeries = response.find(s => s.id === item.seriesId);
    if (!relevantSeries) {
      return accum;
    }

    if (item.episode?.time && item.episode?.duration && item.episode?.number === relevantSeries.numberOfEpisodes) {
      return accum;
    }

    accum.push(relevantSeries);

    return accum;
  }, [] as Series[]);
}


async function getResultsFromURL(query: string): Promise<Series[]> {
  const id = getSeriesId(query);
  if (!id) return [];

  const series = await getSeries(id);
  if (!series) return [];

  return [series];
}
