<template>
  <form @submit.prevent="onSearch">
    <label>
      Ссылка на Шикимори<br>
      <input
        v-model="searchText"
        placeholder="https://shikimori.one/animes/..."
        required
        type="search"
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
      autoplay
      controls
      width="300"
      :src="videos[0].url"
    />
  </section>
</template>

<script lang="ts">
import {defineComponent, ref, watch} from 'vue';
import {asyncComputed, get, set} from '@vueuse/core';
import type {Episode, Translation} from '/@/utils/anime';
import {getEpisodes, getSeries, getTranslations, getVideos} from '/@/utils/anime';

export default defineComponent({
  name: 'HelloWorld',
  setup() {

    // https://shikimori.one/animes/40938-hige-wo-soru-soshite-joshikousei-wo-hirou
    const searchText = ref('');

    const animeID = ref('');
    const onSearch = () => {
      set(animeID, /\/animes\/(?<animeID>[0-9]+)/.exec(get(searchText))?.groups?.animeID);
    };
    const anime = asyncComputed(() => get(animeID) ? getSeries(get(animeID)) : null, null);


    const episodes = asyncComputed<Episode[]>(() => get(animeID) ? getEpisodes(get(animeID)) : [], []);
    const selectedEpisode = ref<Episode | null>(null);
    watch(episodes, () => set(selectedEpisode, get(episodes)[0]));


    const translations = asyncComputed(() => selectedEpisode.value ? getTranslations(selectedEpisode.value.id) : [], []);
    const selectedTranslation = ref<Translation | null>(null);
    watch(translations, () => set(selectedTranslation, get(translations)[0]));


    const videos = asyncComputed(() => selectedTranslation.value ? getVideos(selectedTranslation.value.id) : [], []);


    return {searchText, onSearch, animeID, anime, episodes, selectedEpisode, translations, selectedTranslation, videos};
  },
});
</script>
