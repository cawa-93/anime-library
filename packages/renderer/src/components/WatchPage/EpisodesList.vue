<template>
  <ul class="playlist">
    <li
      v-for="episode of episodes"
      :key="episode.id"
    >
      <router-link
        replace
        :to="{params: {episodeNum: episode.number, translationId: ''}}"
        :class="{active: selectedEpisode === episode}"
      >
        <win-icon class="play-icon">
          &#xF5B0;
        </win-icon>
        {{ episode.title }}
      </router-link>
    </li>
  </ul>
</template>

<script lang="ts">
import type { PropType} from 'vue';
import {computed, defineComponent} from 'vue';
import {useRoute} from 'vue-router';
import type {Episode} from '/@/utils/anime';
import WinIcon from '/@/components/WinIcon.vue';

export default defineComponent({
  name: 'EpisodesList',
  components: {WinIcon},
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
@import "playlist.css";
</style>
