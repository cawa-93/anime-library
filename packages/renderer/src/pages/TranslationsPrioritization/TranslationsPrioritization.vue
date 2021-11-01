<script lang="ts" setup>
import {ref} from 'vue';
import {getPreferences} from '/@/utils/translationRecommendations/getPreferences';
import type {TranslationRecommendationValue} from '/@/utils/translationRecommendations/getDB';
import TranslationsPrioritizationChart from '/@/pages/TranslationsPrioritization/TranslationsPrioritizationChart.vue';
import {asyncComputed} from '@vueuse/core';
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

</script>

<template>
  <main class="p-4 flex flex-col gap-4">
    <section class="card">
      <h3 class="card-header text-base">
        Общий приоритет переводов
      </h3>
      <translations-prioritization-chart
        :preferences="preferences"
        :show-percents="true"
      />
    </section>

    <section
      v-for="t of preferences"
      :key="t.seriesId"
      class="card"
    >
      <h3 class="card-header text-base">
        Приоритет переводов для {{ seriesNamesMap.has(t.seriesId) ? `"${seriesNamesMap.get(t.seriesId)}"` : `аниме с ID ${t.seriesId}` }}
      </h3>
      <translations-prioritization-chart :preferences="[t]" />
    </section>
  </main>
</template>
