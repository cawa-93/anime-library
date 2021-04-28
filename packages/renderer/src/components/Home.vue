<template>
  <form
    @submit.prevent="onSearch"
  >
    <label>
      Ссылка на Шикимори<br>
      <!-- https://shikimori.one/animes/40938-hige-wo-soru-soshite-joshikousei-wo-hirou -->
      <input
        autocomplete="on"
        name="searchText"
        placeholder="https://shikimori.one/animes/..."
        required
        type="url"
      >
    </label>
    <button>Найти</button>
  </form>

  <h3 v-if="anime">
    {{ anime.title }} :
  </h3>

  <section v-if="episodes.length">
    <ol>
      <li
        v-for="episode in episodes"
        :key="episode.id"
      >
        <a
          href="#"
          @click="selectedEpisode = episode"
        >
          <strong v-if="selectedEpisode === episode">{{ episode.title }}</strong>
          <span v-else>{{ episode.title }}</span>

        </a>
      </li>
    </ol>
  </section>

  <h3 v-if="selectedEpisode">
    {{ selectedEpisode.title }}:
  </h3>
  <section v-if="translations.length">
    <ol>
      <li
        v-for="translation of translations"
        :key="translation.id"
      >
        <a
          href="#"
          @click="selectedTranslation = translation"
        >
          <strong v-if="selectedTranslation === translation">{{ translation.title }}</strong>
          <span v-else>{{ translation.title }}</span>

        </a>
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
      autoplay
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
import {defineComponent, ref, watch} from 'vue';
import {asyncComputed, useTitle} from '@vueuse/core';
import type {Episode, Translation, Video} from '/@/utils/anime';
import {getEpisodes, getSeries, getTranslations, getVideos} from '/@/utils/anime';


export default defineComponent({
  name: 'HelloWorld',
  setup() {

    const animeID = ref<`${number}` | undefined>(undefined);

    /**
     * Вместо `Event` нужно использовать `SubmitEvent`
     * Но `SubmitEvent` не добавлен в TypeScript
     * @see https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1005
     */
    const onSearch = (event: Event) => {
      const {searchText} = Object.fromEntries(new FormData(event.target as HTMLFormElement));
      if (typeof searchText !== 'string') {
        throw new Error('Search value must be a string, but got ' + typeof searchText);
      }
      animeID.value = /\/animes\/(?<animeID>[0-9]+)/.exec(searchText)?.groups?.animeID as `${number}`;
    };
    const anime = asyncComputed(() => animeID.value ? getSeries(animeID.value) : null, null);


    const title = useTitle();
    watch(anime, () => anime.value && (title.value = anime.value.title));


    const episodes = asyncComputed(() => animeID.value ? getEpisodes(animeID.value) : [], []);
    const selectedEpisode = ref<Episode | null>(null);
    watch(episodes, () => selectedEpisode.value = episodes.value[0]);


    const translations = asyncComputed(() => selectedEpisode.value ? getTranslations(selectedEpisode.value.id) : [] as Translation[], [] as Translation[]);
    const selectedTranslation = ref<Translation | null>(null);
    watch(translations, () => selectedTranslation.value = translations.value[0]);


    const videos = asyncComputed(() => selectedTranslation.value ? getVideos(selectedTranslation.value.id) : [] as Video[], [] as Video[]);
    const videoElement = ref<HTMLVideoElement | null>(null);
    watch(videos, () => videoElement.value && videoElement.value.load());

    return {onSearch, anime, episodes, selectedEpisode, translations, selectedTranslation, videos, videoElement};
  },
});
</script>
