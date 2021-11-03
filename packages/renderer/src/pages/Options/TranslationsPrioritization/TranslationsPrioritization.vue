<script lang="ts" setup>
import {computed, ref, toRaw} from 'vue';
import {getPreferences} from '/@/utils/translationRecommendations/getPreferences';
import {getDB} from '/@/utils/translationRecommendations/getDB';
import TranslationsPrioritizationChart
  from '/@/pages/Options/TranslationsPrioritization/TranslationsPrioritizationChart.vue';
import {asyncComputed, useAsyncState} from '@vueuse/core';
import type {TranslationType} from '/@/utils/videoProvider';
import {getSeries} from '/@/utils/videoProvider';


const {state: preferences, execute: reloadPreferences} = useAsyncState(getPreferences, [], {resetOnExecute: false});


const seriesNamesMap = asyncComputed<Map<number, string>>(async () => {
  const ids = preferences.value.map(p => p.seriesId);
  if (!ids.length) {
    return new Map();
  }

  const series = await getSeries(ids);
  return new Map(series.map(s => [s.id, s.title]));
}, new Map());

const preferencesWithTitles = computed(() => {
  return preferences.value.map(p => ({...p, title: seriesNamesMap.value.get(p.seriesId)}));
});

const filterQuery = ref('');
const filteredPreferencesWithTitles = computed(() => {
  return preferencesWithTitles.value.filter(p => p.title?.toLowerCase()
    .includes(filterQuery.value.toLowerCase()) || String(p.seriesId).includes(filterQuery.value));
});

const incrementAuthorPriorityForSeries = (seriesId: number, author: string, type: TranslationType) => {
  const series = preferences.value.find(s => s.seriesId === seriesId);
  if (!series || series.type !== type) {
    return;
  }

  const authorIndex = series.author.findIndex(a => a === author);
  if (authorIndex < 1) {
    return;
  }

  // Меняем местами целевого автора с предыдущим
  const tmp = series.author[authorIndex - 1];
  series.author[authorIndex - 1] = author;
  series.author[authorIndex] = tmp;

  getDB().then(db => db.put('preferences', toRaw(series))).then(() => reloadPreferences());
};

const decrementAuthorPriorityForSeries = (seriesId: number, author: string, type: TranslationType) => {
  const series = preferences.value.find(s => s.seriesId === seriesId);
  if (!series || series.type !== type) {
    return;
  }

  const authorIndex = series.author.findIndex(a => a === author);
  if (authorIndex === series.author.length - 1) {
    return;
  }

  // Меняем местами целевого автора со следующим
  const tmp = series.author[authorIndex + 1];
  series.author[authorIndex + 1] = author;
  series.author[authorIndex] = tmp;

  getDB().then(db => db.put('preferences', toRaw(series))).then(() => reloadPreferences());
};

const removeAuthorPriorityForSeries = (seriesId: number, author: string, type: TranslationType) => {
  const seriesIndex = preferences.value.findIndex(s => s.seriesId === seriesId);
  const series = preferences.value[seriesIndex];
  if (!series || series.type !== type) {
    return;
  }

  const authorIndex = series.author.findIndex(a => a === author);
  if (authorIndex === -1) {
    return;
  }

  series.author.splice(authorIndex, 1);

  if (series.author.length === 0) {
    getDB().then(db => db.delete('preferences', series.seriesId)).then(() => reloadPreferences());
  } else {
    getDB().then(db => db.put('preferences', toRaw(series))).then(() => reloadPreferences());
  }

};

const removeAuthorPriorityForAll = (author: string, type: TranslationType) => {
  [...preferences.value].forEach(s => removeAuthorPriorityForSeries(s.seriesId, author, type));
};

// Повышение приоритета автору для всех аниме отключил так как поведение не очевидно для пользователя.
// Боюсь это добавит больше путаницы чем удобства.
// const incrementAuthorPriorityForAll = (author: string, type: TranslationType) => {
//   [...preferences.value].forEach(s => incrementAuthorPriorityForSeries(s.seriesId, author, type));
// };
</script>

<template>
  <div class="">
    <p v-if="!preferencesWithTitles.length">
      Пока что нет ничего. Продолжайте смотреть аниме.
    </p>

    <template v-else>
      <section
        class="card"
      >
        <h3 class="card-header text-base">
          Общий приоритет переводов
        </h3>
        <translations-prioritization-chart
          :preferences="preferencesWithTitles"
          :show-percents="true"
          @remove="removeAuthorPriorityForAll"
        />
      </section>

      <details class="mt-4">
        <summary class="cursor-pointer">
          Приоритет для каждого аниме
        </summary>
        <input
          v-model="filterQuery"
          aria-label="Фильтр аниме по названию"
          placeholder="Фильтр аниме по названию"
          type="search"
          class="mt-4"
        >

        <section
          v-for="t of filteredPreferencesWithTitles"
          :key="t.seriesId"
          class="card mt-4"
        >
          <h3 class="card-header text-base">
            Приоритет переводов для
            {{ t.title ? `"${t.title}"` : `аниме с ID ${t.seriesId}` }}
          </h3>
          <translations-prioritization-chart
            :preferences="[t]"
            @increment="(author, type) => incrementAuthorPriorityForSeries(t.seriesId, author, type)"
            @decrement="(author, type) => decrementAuthorPriorityForSeries(t.seriesId, author, type)"
            @remove="(author, type) => removeAuthorPriorityForSeries(t.seriesId, author, type)"
          />
        </section>
      </details>
    </template>
  </div>
</template>
