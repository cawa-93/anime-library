<script lang="ts" setup>
import {useEpisodes} from '/@/pages/Watch/useEpisodes';
import {computed, defineAsyncComponent, onUnmounted, ref, watch} from 'vue';
import VideoPlayer from '/@/pages/Watch/VideoPlayer/VideoPlayer.vue';
import {asyncComputed, tryOnBeforeUnmount, useFullscreen, useTitle} from '@vueuse/core';
import {getEpisodeMeta, getSeries} from '/@/utils/videoProvider';
import {useTranslations} from '/@/pages/Watch/useTranslations';
import {useVideos} from '/@/pages/Watch/useVideos';
import {useWatchHistory} from '/@/pages/Watch/useWatchHistory';
import {isEpisodeCompleted} from '/@/utils/isEpisodeCompleted';


const PlayLists = defineAsyncComponent(() => import('/@/pages/Watch/PlayLists.vue'));
const ErrorMessage = defineAsyncComponent(() => import('/@/pages/Watch/ErrorMessage.vue'));


const props = defineProps({
  seriesId: {
    type: [String, Number],
    required: true,
  },
});

const seriesIdNumber = computed(() => Number(props.seriesId));

/**
 *
 * Загрузка серий
 */
const {
  selectedEpisode,
  episodes,
  selectNextEpisode,
  nextEpisode,
  isEvaluating: isEvaluatingEpisodes,
} = useEpisodes(seriesIdNumber);


const selectedEpisodeMeta = asyncComputed(
  () => selectedEpisode.value?.number
    ? getEpisodeMeta(seriesIdNumber.value, selectedEpisode.value?.number)
    : undefined,
  undefined,
);


/**
 * Обработка прогресса просмотра
 */
const {currentTime, duration} = useWatchHistory(seriesIdNumber.value, computed(() => selectedEpisode.value?.number));

/**
 * Заголовок эпизода
 */
const displayedTitle = computed(
  () => selectedEpisodeMeta.value
    ? selectedEpisodeMeta.value.episode_id + '. ' + selectedEpisodeMeta.value.title
    : selectedEpisode.value
      ? selectedEpisode.value.title
      : '',
);


/**
 *
 * Загрузка переводов для серии
 */
const selectedEpisodeId = computed(() => selectedEpisode.value?.id);
const {
  selectedTranslation,
  translations,
  isEvaluating: isEvaluatingTranslations,
  preload: preloadTranslations,
} = useTranslations(selectedEpisodeId, seriesIdNumber.value);


/**
 *
 * Загрузка видео для перевода
 */
const selectedTranslationId = computed(() => selectedTranslation.value?.id);
const {video, reload, isEvaluating: isEvaluatingVideo, preload: preloadVideo} = useVideos(selectedTranslationId);

const onSourceError = (qualityToReload: number) => {
  return reload(qualityToReload, true);
};


/**
 * Предзагрузка переводов и видео для следующей серии
 */
watch([nextEpisode, duration, currentTime], async () => {
  if (!(nextEpisode.value && duration.value > 0 && isEpisodeCompleted(currentTime.value, duration.value))) { return; }

  // Загрузка переводов
  const {selectedTranslation: selectedTranslationForNextEpisode} = await preloadTranslations(nextEpisode.value.id);
  if (!selectedTranslationForNextEpisode?.id) {
    return;
  }

  // Загрузка видео для перевода
  await preloadVideo(selectedTranslationForNextEpisode?.id);
});


/**
 * Сообщение об ошибке загрузки
 */
const loadWatchDataError = computed(() => {
  if (episodes.value.length === 0 && !isEvaluatingEpisodes.value) {
    return 'Не удалось загрузить список эпизодов для выбранного аниме';
  }

  if (selectedEpisode.value && translations.value.length === 0 && !isEvaluatingEpisodes.value && !isEvaluatingTranslations.value) {
    return 'Не удалось загрузить список переводов для выбранного эпизода';
  }

  if (selectedTranslation.value && !video.value && !isEvaluatingEpisodes.value && !isEvaluatingTranslations.value && !isEvaluatingVideo.value) {
    return 'Не удалось загрузить видео для выбранного перевода';
  }

  return null;
});

/**
 * Флажок отвечающий за видимость боковой панели с плейлистами
 */
const isSidePanelOpenedFlag = ref(false);

/**
 * Обновление заголовка страницы
 */
const fallbackPageTitle = 'Просмотр аниме';
useTitle(
  asyncComputed(
    () => getSeries(seriesIdNumber.value).then(s => s?.title || fallbackPageTitle),
    fallbackPageTitle,
  ),
);

const isVisibleHeader = ref(true);


const handleControlsVisibilityChanged = (isVisible: boolean) => {
  isVisibleHeader.value = isVisible;
};

const rootEl = ref();
const {exit: exitFullscreen, enter: enterFullscreen, isFullscreen: inFullscreen} = useFullscreen(rootEl);

const setInFullScreenState = (v: boolean) => v ? enterFullscreen() : exitFullscreen();
</script>

<template>
  <main
    ref="rootEl"
    class="relative"
  >
    <transition name="fade">
      <header
        v-if="isVisibleHeader"
        class="absolute top-0 text-white w-full p-3 flex items-start z-2"
      >
        <h2 class="text-lg flex-grow m-0 fw-normal">
          {{ displayedTitle }}
          inFullscreen: {{ inFullscreen }}
          <small
            v-if="selectedEpisodeMeta?.filler"
            class="badge bg-red-500"
          >Филлер</small>

          <small
            v-if="selectedEpisodeMeta?.recap"
            class="badge bg-info text-dark"
          >Рекап</small>
        </h2>

        <button
          v-if="episodes.length > 1 || translations.length"
          title="Выбор эпизода и перевода"
          aria-label="Выбор эпизода и перевода"
          class="open-playlist btn win-icon"
          @click="isSidePanelOpenedFlag = !isSidePanelOpenedFlag"
        >
          &#xE8FD;
        </button>
      </header>
    </transition>

    <play-lists
      v-if="isSidePanelOpenedFlag"
      v-model:is-opened="isSidePanelOpenedFlag"
      v-model:selected-episode="selectedEpisode"
      v-model:selected-translation="selectedTranslation"
      :series-id="seriesIdNumber"
      :episodes="episodes"
      :translations="translations"
    />

    <video-player
      id="video-container"
      v-model:current-time="currentTime"
      v-model:duration="duration"
      :in-fullscreen="inFullscreen"
      :video="video"
      :has-next-episode="!!nextEpisode"
      @goToNextEpisode="selectNextEpisode"
      @source-error="onSourceError"
      @update:controlsVisible="handleControlsVisibilityChanged"
      @update:inFullscreen="setInFullScreenState"
    />
    <error-message
      v-if="loadWatchDataError"
      class="absolute z-3 bg-black top-1/2"
      style="transform: translateY(-50%)"
      :message="loadWatchDataError"
    />
  </main>
</template>


<style scoped>
main {
  background-color: black;
}

header {
  --offset-top: 0.75rem;
  --offset-right: 0.75rem;
  background-image: linear-gradient(360deg, transparent, rgba(0, 0, 0, .75));
  pointer-events: none;
}

header h2 {
  text-shadow: 0 0 5px black;
  pointer-events: none;
}

header .btn {
  @apply hover:(bg-white bg-opacity-30);
  pointer-events: auto;
  position: relative;
}

header .btn:before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  height: calc(100% + var(--offset-top));
  width: calc(100% + var(--offset-right));
}
</style>
