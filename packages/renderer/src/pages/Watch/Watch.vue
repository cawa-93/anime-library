<script lang="ts" setup>
import {useEpisodes} from '/@/pages/Watch/useEpisodes';
import {computed, defineAsyncComponent, ref, watch} from 'vue';
import VideoPlayer from '/@/components/VideoPlayer/VideoPlayer.vue';
import {asyncComputed, useTitle} from '@vueuse/core';
import {getEpisodeMeta, getSeries} from '/@/utils/videoProvider';
import {useTranslations} from '/@/pages/Watch/useTranslations';
import {useVideos} from '/@/pages/Watch/useVideos';
import {useWatchHistory} from '/@/pages/Watch/useWatchHistory';
import {isEpisodeCompleted} from '/@/utils/isEpisodeCompleted';
import {useMediaSessionMetadata} from '/@/use/useMediaSessionMetadata';


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


const series = asyncComputed(() => getSeries(seriesIdNumber.value), undefined);

useMediaSessionMetadata(computed<MediaMetadataInit | null>(() => series.value
  ? ({
    title: selectedEpisode.value?.title || '',
    artist: series.value.title,
    artwork: series.value.poster ? [{
      src: series.value.poster,
    }] : undefined,
  })
  : null,
));


/**
 * Обновление заголовка страницы
 */
const fallbackPageTitle = 'Просмотр аниме';
useTitle(computed(() => series.value?.title || fallbackPageTitle));
</script>

<template>
  <main class="position-relative">
    <video-player
      id="video-container"
      v-model:current-time="currentTime"
      v-model:duration="duration"
      :video="video"
      :has-next-episode="!!nextEpisode"
      @goToNextEpisode="selectNextEpisode"
      @source-error="onSourceError"
    >
      <template #header>
        <header class="position-absolute top-0 text-white w-100 p-3 d-flex align-items-start">
          <h2 class="h5 flex-fill m-0 fw-normal">
            {{ displayedTitle }}

            <small
              v-if="selectedEpisodeMeta?.filler"
              class="badge bg-danger"
            >filler</small>

            <small
              v-if="selectedEpisodeMeta?.recap"
              class="badge bg-info text-dark"
            >recap</small>
          </h2>

          <button
            v-if="episodes.length > 1 || translations.length"
            title="Выбор эпизода и перевода"
            aria-label="Выбор эпизода и перевода"
            class="open-playlist btn btn-dark ignore-prefers-color-scheme win-icon border-0 bg-transparent"
            @click="isSidePanelOpenedFlag = !isSidePanelOpenedFlag"
          >
            &#xE8FD;
          </button>
        </header>
      </template>

      <play-lists
        v-if="isSidePanelOpenedFlag"
        v-model:is-opened="isSidePanelOpenedFlag"
        v-model:selected-episode="selectedEpisode"
        v-model:selected-translation="selectedTranslation"
        :series-id="seriesIdNumber"
        :episodes="episodes"
        :translations="translations"
      />
    </video-player>
    <error-message
      v-if="loadWatchDataError"
      :message="loadWatchDataError"
    />
  </main>
</template>


<style scoped>
main {
  background-color: black;
}

header {
  --offset-top: 1rem;
  --offset-right: 1rem;
  background-image: linear-gradient(360deg, transparent, rgba(0, 0, 0, .75));
  pointer-events: none;
  z-index: 10;
}

header h2 {
  text-shadow: 0 0 5px black;
  pointer-events: none;
}

header .btn {
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
