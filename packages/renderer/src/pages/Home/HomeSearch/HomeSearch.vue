<script lang="ts" setup>
import {nextTick, ref, watch} from 'vue';
import {Popover as Popover, PopoverPanel as PopoverPanel} from '@headlessui/vue';
import {useSearchResults} from '/@/pages/Home/HomeSearch/useSearchResults';
import {useRouter} from 'vue-router';
import ButtonSpinner from '/@/components/ButtonSpinner.vue';
import AnimeLink from '/@/components/AnimeLink.vue';
import {getSeriesKindLocal} from '/@/utils/GetSeriesKindLocal';


/**
 * Текст поиска
 */
const searchText = ref('');

/**
 * Пытается прочитать буфер обмена. Это невозможно если окно не в фокусе.
 * Если удалось прочитать буфер обмена и в нем находится ссылка на аниме -- вставляет его в поисковое поле
 */
const setSearchTextFromClipboardIfPossible = () => {
  navigator.clipboard.readText().then(text => {
    if (searchText.value === '' && text.trim().startsWith('https://shikimori.one/animes/')) {
      searchText.value = text.trim();
    }
  });
};


/**
 * Результаты поиска
 */
const {results, evaluating: isLoading} = useSearchResults(searchText);

/**
 * Индекс активного элемента в результатах
 *
 * Используется для поддержки навигации с клавиатуры по результатам поиска.
 *
 * Изменяется стрелками вверх/вниз.
 */
const activeIndex = ref(0);

/**
 * При обновлении результатов сбросить активный индекс
 */
watch(results, () => {
  activeIndex.value = 0;
  nextTick(scrollToActive);
});

/**
 * Прокручивает область просмотра к активному элементу
 */
const scrollToActive = () => {
  const activeEl = document.body.querySelector<HTMLAnchorElement>('.search-results a.active');
  if (activeEl) {
    activeEl.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
};

/**
 * Переключает активный элемент на следующий
 */
const activateNextItem = () => {
  activeIndex.value = activeIndex.value + 1 === results.value.length ? activeIndex.value = 0 : activeIndex.value + 1;
  nextTick(scrollToActive);
};

/**
 * Переключает активный элемент на предыдущий
 */
const activatePrevItem = () => {
  activeIndex.value = activeIndex.value === 0 ? results.value.length - 1 : activeIndex.value - 1;
  nextTick(scrollToActive);
};

const getRoute = (seriesId: string | number) => ({name: 'Watch', params: {seriesId}});

const router = useRouter();
const handlerSubmit = () => {
  const activeElement = results.value[activeIndex.value];
  router.push(getRoute(activeElement.id));
};
</script>


<template>
  <form
    class="grid grid-cols-[1fr,auto] grid-rows-[auto] relative shadow-lg bg-white dark:bg-dark-900"
    @submit.prevent="handlerSubmit"
    @keydown.down="activateNextItem"
    @keydown.up="activatePrevItem"
    @focusin="setSearchTextFromClipboardIfPossible"
  >
    <label
      for="search-field"
      class="sr-only"
    >Поиск аниме по названию или по ссылке</label>
    <input
      id="search-field"
      v-model="searchText"
      autofocus
      autocomplete="on"
      placeholder="Поиск аниме по названию или по ссылке"
      type="search"
      aria-describedby="search-field-help"
    >

    <button
      class="btn btn-outline border-l-0 rounded-tl-none rounded-bl-none win-icon focus:ring-accent focus:ring-opacity-30 focus:border-accent transition-none"
      type="submit"
      title="Найти"
      aria-label="Найти"
    >
      &#xF78B;
    </button>

    <Popover as="template">
      <PopoverPanel
        static
        class="card search-results"
        aria-live="polite"
        :aria-busy="isLoading"
      >
        <template v-if="results.length">
          <anime-link
            v-for="(result, index) of results"
            :id="result.id"
            :key="result.id"
            :ref="activeIndex === index ? 'activeElement' : ''"
            class="btn block transition-none grid-cols-[auto,1fr] grid-rows-[min-content,min-content,1fr] gap-x-4 gap-y-2 items-start"
            :class="{'active': activeIndex === index}"
            :aria-label="result.title"
          >
            <!--            <img-->
            <!--              v-if="result.poster"-->
            <!--              class="h-[90px] row-span-full"-->
            <!--              role="presentation"-->
            <!--              :src="result.poster"-->
            <!--              alt="Постер"-->
            <!--            >-->
            <strong class="font-medium dark:font-normal"> {{ result.title }}</strong>
            <p class="text-true-gray-500 dark:text-true-gray-400 flex flex-wrap gap-2">
              <small>{{ getSeriesKindLocal(result.kind) }}</small>
              <small v-if="result.year > 0">{{ result.year }} год</small>
            </p>
          </anime-link>
        </template>
        <p
          v-else
          class="opacity-80"
        >
          <template v-if="isLoading">
            <button-spinner class="mr-4" />
            {{ searchText !== '' ? 'Поиск ...' : 'Загрузка недавних просмотров ...' }}
          </template>
          <template v-else>
            {{
              searchText !== '' ? 'По вашему запросу ничего не найдено' : 'Список недавних просмотров пока что пуст'
            }}
          </template>
        </p>
      </PopoverPanel>
    </Popover>
  </form>
</template>

<style scoped>

#search-field {
  @apply border-r-0 rounded-tr-none rounded-br-none focus:border-accent z-2 transition-none ;
}

.search-results {
  @apply absolute top-full z-1 rounded-t-none border-t-0 overflow-y-auto shadow-lg dark:bg-dark-900 invisible ;
  width: 100%;
  max-height: 70vh;
}

form:focus-within .search-results {
  @apply visible;
}

.search-results:not(:hover) .btn.active {
  @apply bg-black bg-opacity-5 dark:(bg-white bg-opacity-5);
}

form:focus-within #search-field,
form:focus-within .btn.btn-outline {
  @apply rounded-b-none z-2;
  border-bottom-color: transparent !important;
}

form:focus-within #search-field,
form:focus-within .search-results,
form:focus-within .btn.btn-outline {
  border-color: theme('colors.accent.DEFAULT');
}
</style>
