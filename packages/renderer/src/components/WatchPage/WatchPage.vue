<template>
  <section
    v-if="videos.length"
    id="video-container"
  >
    <video-player :video-source="videos[0]">
      <!--      <template #controls>-->
      <!--        <button-->
      <!--          style="position: absolute; top: 10px; left: 10px;"-->
      <!--          @click="send('TOGGLE_EPISODES')"-->
      <!--        >-->
      <!--          Episodes-->
      <!--        </button>-->

      <!--        <button-->
      <!--          style="position: absolute; top: 30px; left: 10px;"-->
      <!--          @click="send('TOGGLE_TRANSLATIONS')"-->
      <!--        >-->
      <!--          Translations-->
      <!--        </button>-->
      <!--      </template>-->
    </video-player>
    <!--    <video-->
    <!--      ref="videoElement"-->
    <!--      controls-->
    <!--    >-->
    <!--      <source-->
    <!--        v-for="video of videos"-->
    <!--        :key="video.url"-->
    <!--        :src="video.url"-->
    <!--      >-->
    <!--    </video>-->



    <side-panel
      v-if="episodes"
      id="episodes"
      :is-opened="state.matches('episodesExpanded')"
    >
      <episodes-list
        :episodes="episodes"
      />
    </side-panel>



    <side-panel
      v-if="translations"
      id="translations"
      :is-opened="state.matches('translationsExpanded')"
    >
      <translations-list
        :selected-episode-num="selectedEpisode.number"
        :translations="translations"
      />
    </side-panel>
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


const PanelStateMachine = Machine({
  initial: 'allCollapsed',
  states: {
    allCollapsed: {
      on: {
        TOGGLE_EPISODES: 'episodesExpanded',
        TOGGLE_TRANSLATIONS: 'translationsExpanded',
      },
    },
    episodesExpanded: {
      on: {
        TOGGLE_EPISODES: 'allCollapsed',
        TOGGLE_TRANSLATIONS: 'translationsExpanded',
      },
    },
    translationsExpanded: {
      on: {
        TOGGLE_TRANSLATIONS: 'allCollapsed',
        TOGGLE_EPISODES: 'episodesExpanded',
      },
    },
  },
});


export default defineComponent({
  components: {VideoPlayer, TranslationsList, EpisodesList, SidePanel},
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


    const {now} = useNow();
    return {
      // anime,
      episodes,
      selectedEpisode,
      translations,
      // selectedTranslation,
      videos,
      videoElement,
      // title,

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
</style>
