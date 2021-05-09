<template>
  <ul class="playlist">
    <li
      v-for="episode of episodes"
      :key="episode.id"
    >
      <router-link
        :class="{active: selectedEpisode === episode}"
        :to="{params: {episodeNum: episode.number, translationId: ''}, hash: ''}"
        replace
      >
        <win-icon class="play-icon">
          &#xF5B0;
        </win-icon>
        <span class="nowrap">{{ episode.title }}</span>
      </router-link>
    </li>
  </ul>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {computed, defineComponent} from 'vue';
import {useRoute} from 'vue-router';
import WinIcon from '/@/components/WinIcon.vue';
import type {Episode} from '/@/utils/videoProvider';

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
