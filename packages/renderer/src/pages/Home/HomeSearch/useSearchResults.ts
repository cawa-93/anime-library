import type {Ref} from 'vue';
import {ref, unref} from 'vue';
import {getHistoryItems} from '/@/utils/history-views';
import {asyncComputed} from '@vueuse/core';
import {searchSeries} from '/@/utils/videoProvider/providers/anime365/anime365';


interface SearchResult {
  id: number;
  title: string;
}


export function useSearchResults(input: Ref<string>) {
  const evaluating = ref(false);

  const results = asyncComputed<SearchResult[]>(async () => {
    const query = unref(input);

    if (query !== '') {
      const params = new URLSearchParams({
        query,
      });
      const series = await searchSeries(params);
      return series.map(s => ({
        id: s.id,
        title: s.title,
      }));
    } else {
      return getResultsFromHistory();
    }

    return [];
  }, [], {evaluating});



  return {results};
}


async function getResultsFromHistory() {
  const history = await getHistoryItems();
  const params = new URLSearchParams([
    ...history.map(i => ['myAnimeListId[]', String(i.seriesId)]),
  ]);

  const response = await searchSeries(params);

  console.log({history, params: params.toString(), response});


  return response.filter(s => {
    const relevantHistoryItem = history.find(i => i.seriesId === s.myAnimeListId);
    // Отфильтровать результаты у которых уже просмотрена последняя серия
    return !(
      relevantHistoryItem
      && relevantHistoryItem.episode.time
      && relevantHistoryItem.episode.duration
      && relevantHistoryItem.episode.number === s.numberOfEpisodes
    );
  });
}
