import expectedData from 'src/utils/videoProvider/providers/anime365/episodes-filter-data';
import {resolveEpisodesList} from '/@/utils/videoProvider/providers/anime365/resolveEpisodesList';


describe('Фильтр эпизодов', () => {
  for (const {originalSeries, expectedEpisodes} of expectedData) {
    it('Фтльтр для ' + originalSeries.seriesId, () => {
      const resolved = resolveEpisodesList(originalSeries as any, new Map);
      expect(resolved.map((e: { id: number }) => e.id)).toEqual(expectedEpisodes);
    });
  }
});


export {};
