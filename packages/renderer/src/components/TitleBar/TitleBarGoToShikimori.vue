<script lang="ts" setup>
import {computed} from 'vue';
import {useElectron} from '/@/use/electron';
import {useRoute} from 'vue-router';


const {openURL} = useElectron();
const route = useRoute();
const watchingSeriesId = computed(() => route.name === 'Watch' && route?.params?.seriesId ? route.params.seriesId : undefined);

const openSeriesOnShikimori = () => openURL(`https://shikimori.one/animes/${watchingSeriesId.value}`);
</script>

<template>
  <a
    v-if="watchingSeriesId"
    href=""
    class="btn rounded-0 py-0 border-0 d-flex align-items-center justify-content-center"
    @click.prevent="openSeriesOnShikimori"
  >
    <small class="text-truncate w-100">Открыть на Шикимори</small>
  </a>
</template>



<style scoped>
@import "base-titlebar-button.css";
</style>
