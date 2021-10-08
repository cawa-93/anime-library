import type {Ref} from 'vue';
import {ref, unref, watch} from 'vue';
import {getHistoryItems} from '/@/utils/history-views';
import {useDebounceFn} from '@vueuse/core';
import {SECOND_MS} from '/@/utils/time';
import {getSeriesId} from '/@shared/utils/getSeriesId';
import {getSeries, getSeriesByQuery} from '/@/utils/videoProvider';


interface SearchResult {
  id: number;
  title: string;
  altTitle?: string
  poster?: string
  genres?: string[]
}


const resultsCache = new Map<string, SearchResult[]>();


export function useSearchResults(input: Ref<string>): { results: Ref<SearchResult[]>, evaluating: Ref<boolean> } {
  const evaluating = ref(false);

  const results = ref<SearchResult[]>(resultsCache.get(unref(input)) || []);

  const updateResultsDebounced = useDebounceFn<() => void>(async () => {
    const query = unref(input);

    type ResolverFn = (query: string) => SearchResult[] | Promise<SearchResult[]>
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


async function getResultsFromSearch(query: string): Promise<SearchResult[]> {
  const series = await getSeriesByQuery(query);
  return series.map(s => ({
    id: s.id,
    title: s.title,
    poster: s.poster,
    // genres: s.genres.map(g => g.title),
  }));
}


async function getResultsFromHistory(): Promise<SearchResult[]> {
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

    accum.push({
      id: relevantSeries.id,
      title: relevantSeries.title,
      poster: relevantSeries.poster,
      // genres: relevantSeries.genres.map(g => g.title),
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
    poster: series.poster,
    genres: [],
  }];
}
