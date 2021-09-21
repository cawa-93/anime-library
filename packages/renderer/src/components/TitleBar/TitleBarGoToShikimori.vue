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
    class="btn-title-bar"
    @click.prevent="openSeriesOnShikimori"
  >
    <small>Открыть на Шикимори</small>
  </a>
</template>



<style scoped>
@import "./btn-titlebar.css";
</style>
