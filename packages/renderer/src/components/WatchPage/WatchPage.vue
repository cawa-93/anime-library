<template>
  <section
    v-if="videos.length"
    id="video-container"
  >
    <video-player
      :video-source="videos[0]"
      @video-error="errorHandler"
    >
      <button
        v-if="episodes"
        class="playlist-button"
        @click="send('TOGGLE_EPISODES')"
      >
        <win-icon>&#xE8FD;</win-icon>
      </button>

      <side-panel
        v-if="episodes"
        :is-opened="state.matches('episodesExpanded')"
        @close-request="send('CLOSE')"
      >
        <episodes-list
          :episodes="episodes"
        />
        <translations-list
          :selected-episode-num="selectedEpisode.number"
          :translations="translations"
        />
      </side-panel>
    </video-player>
  </section>
</template>

<script lang="ts">
import {asyncComputed, useNow, useTitle} from '@vueuse/core';
import {computed, defineComponent, ref, watch} from 'vue';
import type {Episode, Translation, Video} from '/@/utils/videoProvider';
import {getEpisodes, getSeries, getTranslations, getVideos} from '/@/utils/videoProvider';
import SidePanel from '/@/components/WatchPage/SidePanel.vue';
import EpisodesList from '/@/components/WatchPage/EpisodesList.vue';
import TranslationsList from '/@/components/WatchPage/TranslationsList.vue';
import {Machine} from 'xstate';
import {useMachine} from '@xstate/vue';
import VideoPlayer from '/@/components/WatchPage/VideoPlayer/VideoPlayer.vue';
import WinIcon from '/@/components/WinIcon.vue';


const PanelStateMachine = Machine({
  initial: 'allCollapsed',
  states: {
    allCollapsed: {
      on: {
        TOGGLE_EPISODES: 'episodesExpanded',
      },
    },
    episodesExpanded: {
      on: {
        TOGGLE_EPISODES: 'allCollapsed',
        CLOSE: 'allCollapsed',

      },
    },
  },
});


export default defineComponent({
  components: {WinIcon, VideoPlayer, TranslationsList, EpisodesList, SidePanel},
  props: {
    seriesId: {
      type: Number,
      required: true,
    },
    episodeNum: {
      type: Number,
      required: false,
      default: null,
    },
    translationId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const anime = asyncComputed(() => props.seriesId ? getSeries(props.seriesId) : null, null);
    const title = useTitle();


    const episodes = asyncComputed(() => props.seriesId ? getEpisodes(props.seriesId) : [] as Episode[], [] as Episode[]);
    const selectedEpisode = computed(() => episodes.value.find(e => e.number == props.episodeNum) || episodes.value[0]);

    const translations = asyncComputed(() => selectedEpisode.value ? getTranslations(selectedEpisode.value.id) : [] as Translation[], [] as Translation[]);
    const selectedTranslation = computed(() => translations.value.find(e => e.id === props.translationId) || translations.value[0]);

    const videos = asyncComputed(() => selectedTranslation.value ? getVideos(selectedTranslation.value.id) : [] as Video[], [] as Video[]);
    const videoElement = ref<HTMLVideoElement | null>(null);
    watch(videos, () => videoElement.value && videoElement.value.load());

    watch([anime, selectedEpisode, selectedTranslation], () => title.value = anime.value?.title + ', ' + selectedEpisode.value?.number + ', ' + selectedTranslation.value?.title);


    const {state, send} = useMachine(PanelStateMachine);

    const errorHandler = (...args: unknown[]) => console.error('VIDEO ERROR:', ...args);

    const {now} = useNow();
    return {
      errorHandler,
      episodes,
      selectedEpisode,
      translations,
      videos,
      videoElement,
      state,
      send,
      now,
    };
  },
});
</script>

<style scoped>
#video-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: black;
}


#video-container video {
  width: 100%;
  height: 100%;
}

.playlist-button {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 18px;
  background: transparent;
  border: none;
  color: white;
  display: flex;
  width: 30px;
  height: 30px;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
}

.playlist-button:not(:disabled):hover {
  background: rgb(255 255 255 / 20%);
  cursor: pointer;
}

</style>
