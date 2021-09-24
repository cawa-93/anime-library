<script lang="ts" setup>
import type {PropType} from 'vue';
import {ref} from 'vue';
import type {Anime as AnimeType} from '/@/pages/Home/AnimeCollection/Anime';
import {useElectron} from '/@/use/electron';


defineProps({
  anime: {
    type: Object as PropType<AnimeType>,
    required: true,
  },
});

const {openURL} = useElectron();
const openAnime = (event: MouseEvent, anime: AnimeType) => {
  if (event.ctrlKey || event.button === 1) {
    event.preventDefault();
    return openURL('https://shikimori.one' + anime.url);
  }
};

const isOverlayVisible = ref(false);
</script>


<template>
  <router-link
    :to="{
      name: 'Watch',
      params: {seriesId: anime.id}
    }"
    class="card block h-[305px] relative"
    style="aspect-ratio: 209 / 300;"
    :style="{
      '--anime-poster-original': anime.image.original ? `url('https://shikimori.one${anime.image.original}')` : '',
      '--anime-poster-preview': anime.image.preview ? `url('https://shikimori.one${anime.image.preview}')` : '',
      '--anime-status-color': (anime.status === 'released'
        ? '#419541'
        : anime.status === 'ongoing'
          ? '#1d78b7'
          : anime.status === 'anons'
            ? '#ca4929'
            : '')
    }"
    :aria-label="anime.russian || anime.name"
    @click="openAnime($event, anime)"
    @auxclick="openAnime($event, anime)"
    @mouseenter="isOverlayVisible = true"
    @mouseleave="isOverlayVisible = false"
    @focusin="isOverlayVisible = true"
    @focusout="isOverlayVisible = false"
  >
    <h3
      class="card-header text-white text-base font-normal"
      style="background-color: var(--anime-status-color);"
    >
      {{ anime.russian || anime.name }}
    </h3>
    <ul>
      <li class="before:content-['aaa'] ">
        {{ anime.status === 'ongoing' ? 'Выходит' : anime.status === 'released' ? 'Вышло' : 'Анонс' }}
      </li>
      <li
        v-if="anime.kind"
        class="list-group-item"
      >
        {{
          anime.kind === 'tv' ? 'TV Сериал' : anime.kind === 'movie' ? 'Фильм' : anime.kind === 'special' ? 'Спешл' : anime.kind.toUpperCase()
        }}
      </li>
      <li
        v-if="anime.status === 'ongoing'"
        class="list-group-item"
      >
        Эпизоды: {{ anime.episodes_aired }} / {{ anime.episodes ? anime.episodes : '?' }}
      </li>
      <li
        v-else-if="anime.status === 'released' && anime.kind !== 'movie'"
        class="list-group-item"
      >
        Эпизодов: {{ anime.episodes ? anime.episodes : '?' }}
      </li>
      <li class="list-group-item">
        Оценка: {{ anime.score }}
      </li>
    </ul>
  </router-link>
</template>

<style scoped>
.card {
  --card-padding: theme('spacing.4')
}

.card:after {
  /*content: "";*/
  background-image: var(--anime-poster-original);
  position: absolute;
  top: 5px;
  left: 0;
  width: 100%;
  height: calc(100% - 5px);
  background-size: cover;
  transition: opacity .2s;
}

.card:hover:after {
  opacity: 0;

}
</style>
