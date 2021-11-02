<script lang="ts" setup>
import {ref, toRaw} from 'vue';
import {getPreferences} from '/@/utils/translationRecommendations/getPreferences';
import type {TranslationRecommendationValue} from '/@/utils/translationRecommendations/getDB';
import {getDB} from '/@/utils/translationRecommendations/getDB';
import TranslationsPrioritizationChart from '/@/pages/TranslationsPrioritization/TranslationsPrioritizationChart.vue';
import {asyncComputed} from '@vueuse/core';
import type {TranslationType} from '/@/utils/videoProvider';
import {getSeries} from '/@/utils/videoProvider';



const preferences = ref<TranslationRecommendationValue[]>([]);
const isLoading = ref(false);

const reloadStat = async () => {
  isLoading.value = true;

  try {
    preferences.value = await getPreferences();
  } finally {
    isLoading.value = false;
  }
};

const seriesNamesMap = asyncComputed(async () => {
  const ids = preferences.value.map(p => p.seriesId);
  if (!ids.length) {
    return new Map();
  }

  const series = await getSeries(ids);
  return new Map(series.map(s => [s.id, s.title]));
}, new Map<number, string>());
reloadStat();

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

  getDB().then(db => db.put('preferences', toRaw(series)));
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

  getDB().then(db => db.put('preferences', toRaw(series)));
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
    preferences.value.splice(seriesIndex, 1);
    getDB().then(db => db.delete('preferences', series.seriesId));
  } else {
    getDB().then(db => db.put('preferences', toRaw(series)));
  }

};

const removeAuthorPriorityForAll = (author: string, type: TranslationType) => {
  [...preferences.value].forEach(s => removeAuthorPriorityForSeries(s.seriesId, author, type));
};
</script>

<template>
  <main class="p-4 flex flex-col gap-4">
    <section
      v-if="preferences.length"
      class="card"
    >
      <h3 class="card-header text-base">
        Общий приоритет переводов
      </h3>
      <translations-prioritization-chart
        :preferences="preferences"
        :show-percents="true"
        @remove="removeAuthorPriorityForAll"
      />
    </section>

    <p v-else>
      Пока что нет ничего. Продолжайте смотреть аниме.
    </p>

    <section
      v-for="t of preferences"
      :key="t.seriesId"
      class="card"
    >
      <h3 class="card-header text-base">
        Приоритет переводов для
        {{ seriesNamesMap.has(t.seriesId) ? `"${seriesNamesMap.get(t.seriesId)}"` : `аниме с ID ${t.seriesId}` }}
      </h3>
      <translations-prioritization-chart
        :preferences="[t]"
        @increment="(author, type) => incrementAuthorPriorityForSeries(t.seriesId, author, type)"
        @decrement="(author, type) => decrementAuthorPriorityForSeries(t.seriesId, author, type)"
        @remove="(author, type) => removeAuthorPriorityForSeries(t.seriesId, author, type)"
      />
    </section>
  </main>
</template>
