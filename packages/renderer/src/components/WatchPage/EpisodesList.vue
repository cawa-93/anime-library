<template>
  <ul>
    <li
      v-for="episode of episodes"
      :key="episode.id"
    >
      <router-link
        replace
        :to="{params: {episodeNum: episode.number, translationId: ''}}"
      >
        <strong v-if="selectedEpisode === episode">{{ episode.title }}</strong>
        <span v-else>{{ episode.title }}</span>
      </router-link>
    </li>
  </ul>
</template>

<script lang="ts">
import type { PropType} from 'vue';
import {computed, defineComponent} from 'vue';
import {useRoute} from 'vue-router';
import type {Episode} from '/@/utils/anime';

export default defineComponent({
  name: 'EpisodesList',
  props: {
    episodes: {
      type: Array as PropType<Episode[]>,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const selectedEpisode = computed(() => props.episodes.find(e => String(e.number) === route.params.episodeNum) || props.episodes[0]);

    return {selectedEpisode};
  },
});
</script>

<style scoped>

</style>
