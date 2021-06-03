<template>
  <form
    class="container shadow card"
    @submit.prevent="onSearch"
  >
    <div class="card-body border-primary">
      <label
        for="search-field"
        class="form-label"
      >Ссылка на аниме</label>
      <div class="input-group">
        <input
          id="search-field"
          v-model="searchText"
          autocomplete="on"
          pattern=".*/animes?/[a-z]*[0-9]+.*"
          placeholder="https://shikimori.one/animes/..."
          required
          type="url"
          class="form-control"
          aria-describedby="search-field-help"
          list="history"
          @input="onDatalistOptionSelect"
        >

        <datalist
          v-if="history.length > 0"
          id="history"
        >
          <optgroup label="Вы недавно смотрели">
            Вы недавно смотрели
            <option
              v-for="item of history"
              :key="item.id"
            >
              {{ item.title }}
            </option>
          </optgroup>
        </datalist>

        <button
          class="btn btn-outline-secondary"
          type="submit"
        >
          <win-icon>&#xF78B;</win-icon>
        </button>
      </div>


      <small
        id="search-field-help"
        class="form-text"
      >
        {{ title || 'Вставьте ссылка на аниме с Шикимори или MyAnimeList' }}
      </small>
    </div>
  </form>
</template>

<script lang="ts">
import {computed, defineComponent, ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import {getSeriesId} from '/@shared/utils/getSeriesId';
import type {Series} from '/@/utils/videoProvider';
import {getEpisodes, getSeries} from '/@/utils/videoProvider';
import {asyncComputed} from '@vueuse/core';
import WinIcon from '/@/components/WinIcon.vue';
import {getHistoryItems} from '/@/utils/history-views';


export default defineComponent({
  name: 'MainSearch',
  components: {WinIcon},
  setup() {

    const router = useRouter();
    const searchText = ref('');
    const animeID = computed(() => getSeriesId(searchText.value));

    const history = ref<Series[]>([]);

    getHistoryItems()
      .then(items => Promise.all(items.map((i) => getSeries(i.seriesId))))
      .then(series => history.value = series.filter(<T>(s?: T): s is T => s !== undefined));


    const onDatalistOptionSelect = () => {
      if (history.value.length === 0) {
        return;
      }

      const searchTextTrimmed = searchText.value.trim();
      const target = history.value.find(i => i && i.title.toLowerCase() === searchTextTrimmed.toLowerCase());
      if (!target) {
        return;
      }

      return open(target.id);
    };


    /**
     * Если удалось определить ID аниме -- выполнить загрузку серий, чтобы они кэшировались
     */
    watch(animeID, () => {
      if (animeID.value) getEpisodes(animeID.value);
    });

    const title = asyncComputed(async () => {
      if (!animeID.value) {
        return '';
      }

      const anime = await getSeries(animeID.value);

      return anime?.title || '';
    }, '');

    /**
     * Вместо `Event` нужно использовать `SubmitEvent`
     * Но `SubmitEvent` не добавлен в TypeScript
     * @see https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1005
     */
    const onSearch = () => {
      if (animeID.value) {
        open(animeID.value);
      }
    };

    const open = (seriesId: number) => router.push({name: 'Watch', params: {seriesId}});

    return {onSearch, onDatalistOptionSelect, searchText, title, history};
  },
});
</script>
