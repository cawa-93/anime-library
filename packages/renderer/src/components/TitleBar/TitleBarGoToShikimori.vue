<script lang="ts" setup>
import {computed} from 'vue';
import {useRoute} from 'vue-router';
import ExternalLink from '/@/components/ExternalLink.vue';

const route = useRoute();
const watchingSeriesId = computed(() => route.name === 'Watch' && route?.params?.seriesId ? route.params.seriesId : undefined);
const href = computed(() => `https://shikimori.one/animes/${watchingSeriesId.value}`);
</script>

<template>
  <external-link
    v-if="watchingSeriesId"
    class="btn-title-bar text-xs"
    :href="href"
  >
    Открыть Шикимори
  </external-link>
</template>



<style scoped>
@import "./btn-titlebar.css";
</style>
