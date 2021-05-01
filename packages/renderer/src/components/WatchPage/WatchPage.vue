<template>
  <section
    v-if="videos.length"
    id="video-container"
  >
    <video
      ref="videoElement"
      controls
    >
      <source
        v-for="video of videos"
        :key="video.url"
        :src="video.url"
      >
    </video>

    <button
      style="position: absolute; top: 10px; left: 10px;"
      @click="() => toggleEpisodeListState(true)"
    >
      Episodes
    </button>

    <side-panel
      v-if="episodes"
      id="episodes"
      :is-opened="isEpisodeListOpened"
    >
      <episodes-list
        :episodes="episodes"
      />
    </side-panel>


    <button
      style="position: absolute; top: 30px; left: 10px;"
      @click="() => toggleTranslationListState(true)"
    >
      Translations
    </button>
    <side-panel
      v-if="translations"
      id="translations"
      :is-opened="isTranslationListOpened"
    >
      <translations-list :translations="translations" />
    </side-panel>
  </section>
</template>

<script lang="ts">
import {asyncComputed, useTitle} from '@vueuse/core';
import {computed, defineComponent, ref, watch} from 'vue';
import type {Episode, Translation, Video} from '/@/utils/anime';
import {getEpisodes, getSeries, getTranslations, getVideos} from '/@/utils/anime';
import SidePanel from '/@/components/WatchPage/SidePanel.vue';
import EpisodesList from '/@/components/WatchPage/EpisodesList.vue';
import TranslationsList from '/@/components/WatchPage/TranslationsList.vue';

export default defineComponent({
  components: {TranslationsList, EpisodesList, SidePanel},
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

    const isEpisodeListOpened = ref(false);
    const toggleEpisodeListState = (val?: boolean) => {
      isEpisodeListOpened.value = val ?? !isEpisodeListOpened.value;
      isEpisodeListOpened.value && (isTranslationListOpened.value = false);
    };
    const episodeListElement = ref(null);

    const isTranslationListOpened = ref(false);
    const toggleTranslationListState = (val?: boolean) => {
      isTranslationListOpened.value = val ?? !isTranslationListOpened.value;
      isTranslationListOpened.value && (isEpisodeListOpened.value = false);
    };
    const translationListElement = ref(null);


    // onClickOutside(episodeListElement, () => isEpisodeListOpened.value && toggleEpisodeListState(false));
    return {
      anime,
      episodes,
      selectedEpisode,
      translations,
      selectedTranslation,
      videos,
      videoElement,
      title,
      isEpisodeListOpened,
      toggleEpisodeListState,
      episodeListElement,
      isTranslationListOpened,
      toggleTranslationListState,
      translationListElement,
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
}


#video-container video {
  width: 100%;
  height: 100%;
}
</style>
