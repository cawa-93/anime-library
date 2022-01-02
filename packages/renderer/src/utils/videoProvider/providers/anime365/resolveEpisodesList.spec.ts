import expectedData from '/@/utils/videoProvider/providers/anime365/episodes-filter-data';
import {resolveEpisodesList} from '/@/utils/videoProvider/providers/anime365/resolveEpisodesList';
import {describe, test, expect} from 'vitest';


describe('Фильтр эпизодов', () => {
  for (const {originalSeries, expectedEpisodes} of expectedData) {
    test.concurrent('Фильтр для ' + originalSeries.seriesId, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resolved = resolveEpisodesList(originalSeries as any);
      expect(resolved.map((e: { id: number }) => e.id)).toEqual(expectedEpisodes);
    });
  }
});
