<template>
  <h3 v-if="anime">
    {{ anime.title }} :
  </h3>

  <section v-if="episodes.length">
    <ol>
      <li
        v-for="episode in episodes"
        :key="episode.id"
      >
        <router-link
          :to="{params: {episodeNum: episode.number, translationId: ''}}"
        >
          <strong v-if="selectedEpisode === episode">{{ episode.title }}</strong>
          <span v-else>{{ episode.title }}</span>
        </router-link>
      </li>
    </ol>
  </section>

  <h3 v-if="selectedEpisode">
    {{ selectedEpisode.title }}:
  </h3>
  episodeNum: {{ episodeNum }}
  <pre>{{ selectedEpisode }}</pre>
  <section v-if="translations.length">
    <ol>
      <li
        v-for="translation of translations"
        :key="translation.id"
      >
        <router-link :to="{params: {translationId: translation.id}}">
          <strong v-if="selectedTranslation === translation">{{ translation.title }}</strong>
          <span v-else>{{ translation.title }}</span>
        </router-link>
      </li>
    </ol>
  </section>


  <h3 v-if="selectedTranslation">
    {{ selectedTranslation.title }}:<br>
  </h3>

  <section
    v-if="videos.length"
  >
    <video
      ref="videoElement"

      controls
      width="300"
    >
      <source
        v-for="video of videos"
        :key="video.url"
        :src="video.url"
      >
    </video>
  </section>
</template>

<script lang="ts">
import {asyncComputed, useTitle} from '@vueuse/core';
import {computed, defineComponent, ref, watch} from 'vue';
import type {Translation, Video} from '/@/utils/anime';
import {getEpisodes, getSeries, getTranslations, getVideos} from '/@/utils/anime';

export default defineComponent({
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
    watch(anime, () => anime.value && (title.value = anime.value.title));


    const episodes = asyncComputed(() => props.seriesId ? getEpisodes(props.seriesId) : [], []);
    const selectedEpisode = computed(() => episodes.value.find(e => e.number == props.episodeNum) || episodes.value[0]);


    const translations = asyncComputed(() => selectedEpisode.value ? getTranslations(selectedEpisode.value.id) : [] as Translation[], [] as Translation[]);
    const selectedTranslation = computed(() => translations.value.find(e => e.id === props.translationId) || translations.value[0]);

    const videos = asyncComputed(() => selectedTranslation.value ? getVideos(selectedTranslation.value.id) : [] as Video[], [] as Video[]);
    const videoElement = ref<HTMLVideoElement | null>(null);
    watch(videos, () => videoElement.value && videoElement.value.load());

    return {anime, episodes, selectedEpisode, translations, selectedTranslation, videos, videoElement};
  },
});
</script>
