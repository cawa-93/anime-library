<template>
  <form
    @submit.prevent="onSearch"
  >
    <label>
      Ссылка на Шикимори<br>
      <!-- https://shikimori.one/animes/40938-hige-wo-soru-soshite-joshikousei-wo-hirou -->
      <input
        v-model="searchText"
        autocomplete="on"
        pattern=".*/animes?/[a-z]*[0-9]+.*"
        placeholder="https://shikimori.one/animes/..."
        required
        type="url"
      >
      <p><small>{{ title }}</small></p>
    </label>
    <button>Найти</button>
  </form>
</template>

<script lang="ts">
import {computed, defineComponent, ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import {getSeriesId} from '/@shared/utils/getSeriesId';
import {asyncComputed} from '@vueuse/core';
import {getEpisodes, getSeries} from '/@/utils/videoProvider';


export default defineComponent({
  name: 'Home',
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
label {
  display: block;
}

input:invalid {
  border-color: red;
}

</style>
