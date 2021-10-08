<script lang="ts" setup>
import type {PropType} from 'vue';
import {computed} from 'vue';
import type {Anime as AnimeType} from '/@/pages/Home/AnimeCollection/Anime';
import {formatDate} from '/@/utils/formatDate';
import AnimeLink from '/@/components/AnimeLink.vue';
import {getLang} from '/@/pages/Options/OptionsAnimeTitleLang/OptionsAnimeTitleLangController';

declare module 'csstype' {
  interface Properties {
    '--bullet-color'?: string;
  }
}

const props = defineProps({
  anime: {
    type: Object as PropType<AnimeType>,
    required: true,
  },
});

const title = computed(() => {
  const lang = getLang();
  return lang === 'ru' ? (props.anime.russian || props.anime.name) : props.anime.name;
});
const statusRussian = computed(() => {
  switch (props.anime.status) {
    case 'released' :
      return 'Вышло';
    case 'ongoing' :
      return 'Онгоинг';
    case 'anons' :
      return 'Анонс';
    default :
      return props.anime.status;
  }
});

const statusColorRGB = computed(() => {
  switch (props.anime.status) {
    case 'released' :
      return '65, 149, 65'; //'#419541';
    case 'ongoing' :
      return '29, 120, 183';//'#1d78b7';
    case 'anons' :
      return '202, 73, 41';//'#ca4929';
    default :
      return '';
  }
});

const statusColor = computed(() => statusColorRGB.value ? `rgb(${statusColorRGB.value})` : '');

const scoreColor = computed(() => {
  const score = parseFloat(props.anime.score);
  return score > 9.5 ? '#c026d3'
    : score > 8.5 ? '#65a30d'
      : score > 7.5 ? '#4f46e5'
        : score > 6.5 ? '#d97706'
          : '#ef4444';
});

const kindRussian = computed(() => {
  switch (props.anime.kind) {
    case 'tv' :
      return 'TV Сериал';
    case 'movie' :
      return 'Фильм';
    case 'special' :
      return 'Спешл';
    default :
      return props.anime.kind?.toUpperCase();
  }
});

const airedOnFormat = computed(() => props.anime.aired_on ? formatDate(Date.parse(props.anime.aired_on)) : null);

const poster = computed(() => {
  const imagePath = props.anime.image.original || props.anime.image.preview;
  return imagePath ? `https://shikimori.one${imagePath}` : '';
});
</script>


<template>
  <anime-link
    :id="anime.id"
    class="card overflow-hidden block h-[320px] relative leading-relaxed shadow-md border-['#fff']"
    :style="{
      '--anime-status-color': statusColor,
      '--anime-status-color-rgb': statusColorRGB,
    }"
    :aria-label="anime.russian || anime.name"
  >
    <h3
      class="card-header text-white text-base font-normal leading-snug font-light !mb-0"
      style="background-color: var(--anime-status-color);"
    >
      {{ title }}
    </h3>
    <div v-if="kindRussian">
      {{ kindRussian }}
    </div>
    <div
      v-if="airedOnFormat"
      class="inset"
    >
      {{ airedOnFormat }}
    </div>
    <div
      v-if="statusRussian"
      :style="{'--bullet-color': statusColor}"
    >
      {{ statusRussian }}
    </div>
    <div
      v-if="anime.episodes || anime.episodes_aired"
      class="inset"
    >
      Эпизодов: {{
        anime.status === 'released' ? anime.episodes : `${anime.episodes_aired}&nbsp;из&nbsp;${anime.episodes > 0 ? anime.episodes : '?'}`
      }}
    </div>
    <div
      v-if="anime.score"
      :style="{'--bullet-color': scoreColor}"
    >
      Рейтинг: {{ anime.score }}
    </div>

    <img
      v-if="poster"
      role="presentation"
      :src="poster"
      alt=""
      class="poster p-0 absolute top-0 left-0 w-full h-full"
    >
  </anime-link>
</template>

<style scoped>
/*noinspection CssUnresolvedCustomProperty*/
.card {
  --card-padding: theme('spacing.4');
  aspect-ratio: 209 / 300;
  --tw-shadow-color: var(--anime-status-color-rgb);
  border-color: rgba(var(--anime-status-color-rgb), var(--tw-border-opacity));
  display: grid;
  grid-template-rows: min-content;
  padding-bottom: 0;
}

.card img[role="presentation"] {
  transform: translateY(5px);
  transition: transform 350ms cubic-bezier(0.54, 0.22, 0.59, 1.13);
  object-fit: cover;
}

.card:hover img[role="presentation"],
.card:focus img[role="presentation"] {
  transform: translateY(100%);
}


@media (prefers-reduced-motion: reduce) {
  .card img[role="presentation"] {
    transition-property: opacity;
  }

  .card:hover img[role="presentation"],
  .card:focus img[role="presentation"] {
    transform: translateY(0);
    opacity: 0;
  }
}

.card > div {
  @apply relative;
  --bullet-size: 0.4em;
  --bullet-gap: 0.9em;
  margin-left: calc(0px - var(--card-padding));
  margin-right: calc(0px - var(--card-padding));
  padding: 0.2em var(--card-padding) 0.2em calc(var(--card-padding) / 1.5 + var(--bullet-gap));
  display: flex;
  align-items: center;
}

.card > div:not(:first-of-type) {
  @apply border-t-1 border-opacity-30 border-true-gray-500;
}

.card > div.inset {
  margin-left: calc(var(--card-padding) / 1.5 + var(--bullet-gap) - var(--card-padding));
  padding-left: 0;
}

/*noinspection CssUnresolvedCustomProperty*/
.card > div:not(.inset):before {
  @apply rounded-1 absolute;
  content: "";
  display: block;
  width: var(--bullet-size);
  height: var(--bullet-size);
  background-color: var(--bullet-color, currentColor);
  top: calc(50% - var(--bullet-size) / 2);
  transform: translateX(calc(0px - var(--bullet-gap)));
  box-shadow: 0 0 10px 0px var(--bullet-color, currentColor);
}
</style>
