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

<script lang="ts">
import {computed, defineComponent} from 'vue';
import {useElectron} from '/@/use/electron';
import {useRoute} from 'vue-router';


export default defineComponent({
  name: 'OpenShikimori',
  setup() {
    const {openURL} = useElectron();
    const route = useRoute();
    const watchingSeriesId = computed(() => route.name === 'Watch' && route?.params?.seriesId ? route.params.seriesId : undefined);

    const openSeriesOnShikimori = () => openURL(`https://shikimori.one/animes/${watchingSeriesId.value}`);


    return {
      watchingSeriesId,
      openSeriesOnShikimori,
    };
  },
});
</script>

<style scoped>
@import "base-titlebar-button.css";
</style>
