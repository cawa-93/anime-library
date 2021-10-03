<script lang="ts" setup>
import {ref} from 'vue';

import {Popover as Popover, PopoverPanel as PopoverPanel} from '@headlessui/vue';
import {useSearchResults} from '/@/pages/Home/HomeSearch/useSearchResults';
import {useRouter} from 'vue-router';


/**
 * Находится ли фокус в поле поиска.
 * Используется чтобы скрывать выпадающее меню с результатами когда поле не в фокусе
 */
const isFocusin = ref(false);

/**
 * Текст поиска
 */
const searchText = ref('');

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
 * Переключает активный элемент на следующий
 */
const activateNextItem = () => {
  activeIndex.value = activeIndex.value + 1 === results.value.length ? activeIndex.value = 0 : activeIndex.value + 1;
};

/**
 * Переключает активный элемент на предыдущий
 */
const activatePrevItem = () => {
  activeIndex.value = activeIndex.value === 0 ? results.value.length - 1 : activeIndex.value - 1;
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
    class="card grid grid-cols-[1fr,auto] grid-rows-[auto] relative"
    @submit.prevent="handlerSubmit"
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
      type="search"
      class="border-r-0 rounded-tr-none rounded-br-none focus:ring-accent focus:ring-opacity-30 focus:border-accent"
      aria-describedby="search-field-help"
      @focusin="isFocusin = true"
      @focusout="isFocusin = false"
      @keydown.down="activateNextItem"
      @keydown.up="activatePrevItem"
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
          v-if="isFocusin && (isLoading || results.length || searchText !== '')"
          static
          class="card shadow-none search-results"
        >
          <template v-if="results.length">
            <router-link
              v-for="(result, index) of results"
              :key="result.id"
              :ref="activeIndex === index ? 'activeElement' : ''"
              :to="getRoute(result.id)"
              class="btn block"
              :class="{'active': activeIndex === index}"
            >
              {{ result.title }}
            </router-link>
          </template>
          <p v-else-if="!isLoading && searchText !== ''">
            Ничего не найдено
          </p>
        </PopoverPanel>
      </transition>
    </Popover>
  </form>
</template>

<style scoped>
.search-results {
  @apply absolute z-10 absolute z-10 rounded-t-none border-t-0 overflow-y-auto;
  transform: translateY(-2px);
  width: calc(100% - var(--card-padding) * 2);
  max-height: calc(100vh - 150px);
}

.search-results:not(:hover) .btn.active {
  @apply bg-black bg-opacity-5 dark:(bg-white bg-opacity-5);
}

form:focus-within #search-field,
form:focus-within .search-results,
form:focus-within .btn.btn-outline {
  border-color: theme('colors.accent.DEFAULT');
}
</style>
