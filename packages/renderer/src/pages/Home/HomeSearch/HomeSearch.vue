<script lang="ts" setup>
import {ref} from 'vue';

import {Popover as Popover, PopoverPanel as PopoverPanel} from '@headlessui/vue';
import {useSearchResults} from '/@/pages/Home/HomeSearch/useSearchResults';

// const router = useRouter();
const searchText = ref('');


const {results} = useSearchResults(searchText);

const isFocusin = ref(false);
// navigator.clipboard.readText().then(t => {
//   if (getSeriesId(t)) { // Простой способ проверить текст в буфере
//     searchText.value = t;
//   }
// }).catch(() => ({})); // Если прочитать буфер не удалось просто заглушить сообщение об ошибке


// const animeID = computed(() => getSeriesId(searchText.value));

// const history = ref<Series[]>([]);
//
// getHistoryItems()
//   .then(items => Promise.all(items.map((i) => getSeries(i.seriesId))))
//   .then(series => history.value = series.filter(<T>(s?: T): s is T => s !== undefined));


// const onDatalistOptionSelect = () => {
//   if (history.value.length === 0) {
//     return;
//   }
//
//   const searchTextTrimmed = searchText.value.trim();
//   const target = history.value.find(i => i && i.title.toLowerCase() === searchTextTrimmed.toLowerCase());
//   if (!target) {
//     return;
//   }
//
//   return open(target.id);
// };


/**
 * Если удалось определить ID аниме -- выполнить загрузку серий, чтобы они кэшировались
 */
// watch(animeID, () => {
//   if (animeID.value) getEpisodes(animeID.value);
// });

// const title = asyncComputed(async () => {
//   if (!animeID.value) {
//     return '';
//   }
//
//   const anime = await getSeries(animeID.value);
//
//   return anime?.title || '';
// }, '');

/**
 * Вместо `Event` нужно использовать `SubmitEvent`
 * Но `SubmitEvent` не добавлен в TypeScript
 * @see https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1005
 */
// const onSearch = () => {
//   if (animeID.value) {
//     open(animeID.value);
//   }
// };

// const open = (seriesId: number) => router.push({name: 'Watch', params: {seriesId}});
</script>


<template>
  <form
    class="card grid grid-cols-[1fr,auto] grid-rows-[auto] relative"
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
      placeholder="Поиск аниме по названию или по ссылке"
      required
      type="text"
      class="border-r-0 rounded-tr-none rounded-br-none focus:ring-accent focus:ring-opacity-30 focus:border-accent"
      aria-describedby="search-field-help"
      @focusin="isFocusin = true"
      @focusout="isFocusin = false"
    >


    <button
      class="btn btn-outline border-l-0 rounded-tl-none rounded-bl-none win-icon focus:ring-accent focus:ring-opacity-30 focus:border-accent"
      type="submit"
      title="Найти"
      aria-label="Найти"
    >
      &#xF78B;
    </button>

    <Popover>
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-1 opacity-0"
      >
        <PopoverPanel
          v-if="isFocusin"
          static
          class="card shadow-none search-results"
        >
          <router-link
            v-for="result of results"
            :key="result.id"
            :to="{name: 'Watch', params: {seriesId: result.id}}"
            class="btn block"
          >
            {{ result.title }}
          </router-link>
        </PopoverPanel>
      </transition>
    </Popover>
  </form>
</template>

<style scoped>
.search-results {
  @apply absolute z-10 absolute z-10 rounded-t-none border-t-0;
  transform: translateY(-2px);
  width: calc(100% - var(--card-padding) * 2);
}

form:focus-within .search-results,
form:focus-within .btn.btn-outline {
  border-color: theme('colors.accent.DEFAULT');
}
</style>
