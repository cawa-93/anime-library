<script lang="ts" setup>
import {computed, ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import {getSeriesId} from '/@shared/utils/getSeriesId';
import type {Series} from '/@/utils/videoProvider';
import {getEpisodes, getSeries} from '/@/utils/videoProvider';
import {asyncComputed} from '@vueuse/core';
import {getHistoryItems} from '/@/utils/history-views';



const router = useRouter();
const searchText = ref('');
navigator.clipboard.readText().then(t => {
  if (getSeriesId(t)) { // Простой способ проверить текст в буфере
    searchText.value = t;
  }
}).catch(() => ({})); // Если прочитать буфер не удалось просто заглушить сообщение об ошибке
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
</script>


<template>
  <form
    class="card grid grid-cols-[1fr,auto] grid-rows-[auto]"
    @submit.prevent="onSearch"
  >
    <label
      for="search-field"
      class="sr-only"
    >Поиск</label>
    <input
      id="search-field"
      v-model="searchText"
      autofocus
      autocomplete="on"
      pattern=".*/animes?/[a-z]*[0-9]+.*"
      placeholder="Поиск аниме по названию или по ссылке"
      required
      type="url"
      class="border-r-0 rounded-tr-none rounded-br-none"
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
      class="btn btn-outline border-l-0 rounded-tl-none rounded-bl-none win-icon"
      type="submit"
      title="Найти"
      aria-label="Найти"
    >
      &#xF78B;
    </button>
  </form>
</template>

