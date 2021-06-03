<template>
  <form
    class="container shadow"
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
        >
        <button
          class="btn btn-outline-secondary"
          type="submit"
        >
          <win-icon>&#xF78B;</win-icon>
        </button>
      </div>


      <div
        id="search-field-help"
        class="form-text"
      >
        {{ title || 'Вставьте ссылка на аниме с Шикимори или MyAnimeList' }}
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import {computed, defineComponent, ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import {getSeriesId} from '/@shared/utils/getSeriesId';
import {getEpisodes, getSeries} from '/@/utils/videoProvider';
import {asyncComputed} from '@vueuse/core';
import WinIcon from '/@/components/WinIcon.vue';


export default defineComponent({
  name: 'MainSearch',
  components: {WinIcon},
  setup() {

    const router = useRouter();
    const defaultSearchText = import.meta.env.MODE === 'development' ? 'https://shikimori.org/animes/14719-jojo-no-kimyou-na-bouken-tv' : '';
    const searchText = ref(defaultSearchText);
    const animeID = computed(() => getSeriesId(searchText.value));

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
        router.push({name: 'Watch', params: {seriesId: animeID.value}});
      }
    };

    return {onSearch, searchText, title};
  },
});
</script>

<style scoped>

</style>
