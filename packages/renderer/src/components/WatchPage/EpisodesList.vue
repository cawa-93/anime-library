<template>
  <ul
    ref="root"
    class="playlist"
  >
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
import type {DeepReadonly, PropType} from 'vue';
import {computed, defineComponent, onMounted, ref} from 'vue';
import {useRoute} from 'vue-router';
import WinIcon from '/@/components/WinIcon.vue';
import type {Episode} from '/@/utils/videoProvider';

export default defineComponent({
  name: 'EpisodesList',
  components: {WinIcon},
  props: {
    episodes: {
      type: Array as PropType<DeepReadonly<Episode[]>>,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const root = ref<HTMLElement>();
    const selectedEpisode = computed(() => props.episodes.find(e => String(e.number) === route.params.episodeNum) || props.episodes[0]);

    onMounted(() => {
      const activeElement: HTMLElement = root.value?.querySelector('.active');
      if (activeElement) {
        activeElement.scrollIntoView();
      }
    });

    return {selectedEpisode, root};
  },
});
</script>

<style scoped>
@import "playlist.css";
</style>
