<script lang="ts" setup>
import {computed, defineAsyncComponent, ref, toRaw, watch} from 'vue';
import type {Episode, Translation, Video} from '/@/utils/videoProvider';
import {clearVideosCache, getEpisodeMeta, getSeries, getVideo} from '/@/utils/videoProvider';
import VideoPlayer from '/@/components/WatchPage/VideoPlayer/VideoPlayer.vue';
import {getEpisodesList, getTranslationsList} from '/@/utils/prepareWatchData';
import type {HistoryViewsItem} from '/@/utils/history-views';
import {getViewHistoryItem, putHistoryItem} from '/@/utils/history-views';
import {asyncComputed, ignorableWatch, useDebounceFn, useTitle} from '@vueuse/core';
import {showErrorMessage} from '/@/utils/dialogs';
import {isEpisodeCompleted} from '/@/utils/isEpisodeCompleted';
import {SECOND_MS} from '/@/utils/time';
import {useMediaSessionMetadata} from '/@/components/WatchPage/VideoPlayer/useMediaSession';


const SidePanel = defineAsyncComponent(() => import('/@/components/SidePanel.vue'));
const TabsSection = defineAsyncComponent(() => import('/@/components/TabsSection.vue'));
const TranslationsList = defineAsyncComponent(() => import('/@/components/WatchPage/TranslationsList.vue'));
const EpisodesList = defineAsyncComponent(() => import('/@/components/WatchPage/EpisodesList.vue'));


const DEFAULT_PAGE_TITLE = 'Просмотр аниме';

const props = defineProps({
  seriesId: {
    type: [String, Number],
    required: true,
  },
  episodeNum: {
    type: [String, Number],
    required: false,
    default: '',
  },
  translationId: {
    type: [String, Number],
    required: false,
    default: '',
  },
});

document.title = DEFAULT_PAGE_TITLE;
const error = ref('');
const reloadPage = () => {
  location.pathname = `/watch/${props.seriesId}/`;
};


/**
 * Загрузка серий
 */
const episodes = ref<Episode[]>([]);
const currentEpisode = ref<Episode | undefined>();
const currentEpisodeMeta = asyncComputed(() => currentEpisode.value?.number ? getEpisodeMeta(Number(props.seriesId), currentEpisode.value?.number) : undefined, undefined);
watch(() => props.seriesId, (seriesId, oldSeriesId) => {

  if (seriesId === oldSeriesId) {
    return;
  }

  error.value = '';
  episodes.value = [];
  currentEpisode.value = undefined;

  getEpisodesList(seriesId, props.episodeNum === '' ? undefined : props.episodeNum)
    .then(({startItem: startEpisode, items: eps}) => {
      if (eps.length === 0) {
        error.value = 'Не было найдено ни одной серии для выбранного аниме';
        return;
      }

      episodes.value = eps;

      if (startEpisode !== undefined) {
        currentEpisode.value = startEpisode;
      }

    });
}, {immediate: true});

/**
 * Загрузка переводов
 */
const translations = ref<Translation[]>([]);
const currentTranslation = ref<Translation | undefined>();
const {ignoreUpdates: doNotUpdateEpisodes} = ignorableWatch(currentEpisode, (currentEpisode, oldCurrentEpisode) => {
  if (currentEpisode && oldCurrentEpisode && currentEpisode.id === oldCurrentEpisode.id) {
    return;
  }

  error.value = '';
  translations.value = [];
  currentTranslation.value = undefined;

  if (!currentEpisode) {
    return;
  }


  getTranslationsList(currentEpisode.id, props.seriesId, !props.translationId ? undefined : props.translationId)
    .then(({startItem: startTranslation, items: trs}) => {
      if (trs.length === 0) {
        error.value = 'Не найдено ни одного перевода для выбранной серии';
        return;
      }

      translations.value = trs;

      if (startTranslation !== undefined) {
        currentTranslation.value = startTranslation;
      }
    });
}, {immediate: true});

/**
 * Загрузка видео
 */
const video = ref<Video>();

const loadVideoSources = async (selectedTranslationId: number, clearCache = false, quality = 0) => {
  error.value = '';
  if (clearCache) {
    await clearVideosCache(selectedTranslationId);
  }

  getVideo(selectedTranslationId)
    .catch((err) => {

      const title = 'Не удалось загрузить видео с Anime.365';
      const message: string = err.code === 403
        ? 'Перейдите в настройки и обновите ключ доступа'
        : err.message !== undefined
          ? err.message
          : typeof err === 'string'
            ? err
            : JSON.stringify(err);

      showErrorMessage({title, message});

      return undefined;
    })
    .then(v => {
      if (!v) {
        error.value = 'Нет загруженных видео. Попробуйте выбрать другой перевод';
        return;
      }

      const targetQualityVideo = v.qualities.get(quality);

      if (!video.value || !targetQualityVideo) {
        video.value = v;
      } else {
        video.value?.qualities.set(quality, targetQualityVideo);
      }

    });
};


const {ignoreUpdates: doNotUpdateVideos} = ignorableWatch(currentTranslation, (currentTranslation, oldCurrentTranslation) => {
  if (currentTranslation && oldCurrentTranslation && currentTranslation.id === oldCurrentTranslation.id) {
    return;
  }

  video.value = undefined;

  if (!currentTranslation) {
    return;
  }

  loadVideoSources(currentTranslation.id);
}, {immediate: true});

const onSourceError = (selectedQuality = 0) => {
  if (currentTranslation.value?.id) {
    loadVideoSources(currentTranslation.value.id, true, selectedQuality);
  }
};


/**
 * Подготовка следующей серии
 */
const nextEpisode = computed(() => {
  if (!currentEpisode.value) {
    return null;
  }

  let minEpisodeByNum: Episode | null = null;
  for (const e of episodes.value) {
    if (e.number <= currentEpisode.value.number) {
      continue;
    }

    if (minEpisodeByNum === null || minEpisodeByNum.number > e.number) {
      minEpisodeByNum = e;
    }
  }

  return minEpisodeByNum;
});


/**
 * Загрузка переводов и видео для следующей серии
 */
let nextEpisodeMetadata: {
  basedOn: {
    episode: number,
    translation: number
  },
  translations?: Translation[],
  startTranslation?: Translation,
  video?: Video
} | null = null;


/**
 * Загружает переводы и видео для следующей серии
 */
const updateNextEpisodeMetadata = async () => {
  const nextEpisodeId = nextEpisode.value?.id;
  const currentTranslationId = currentTranslation.value?.id;

  if (!nextEpisodeId || !currentTranslationId) {
    return;
  }

  /**
   * Если данные для целевой серии и перевода уже загружены не делать ничего
   */
  if (nextEpisodeMetadata !== null
    && nextEpisodeMetadata.basedOn.episode === nextEpisodeId
    && nextEpisodeMetadata.basedOn.translation === currentTranslationId) {
    return;
  }

  nextEpisodeMetadata = {
    basedOn: {
      episode: nextEpisodeId,
      translation: currentTranslationId,
    },
  };

  const {
    items: translations,
    startItem: startTranslation,
  } = await getTranslationsList(nextEpisodeId, props.seriesId).catch(e => {
    console.error(e);
    nextEpisodeMetadata = null;
    return {items: [], startItem: undefined};
  });

  /**
   * Необходимо заново проверить {@link nextEpisodeId} и {@link currentTranslationId}
   * так как за время асинхронного запроса {@link nextEpisode} или {@link currentTranslation} могли изменится
   */
  if (!startTranslation || nextEpisodeId !== nextEpisode.value?.id || currentTranslationId !== currentTranslation.value?.id) {
    nextEpisodeMetadata = null;
    return;
  }

  nextEpisodeMetadata = {
    basedOn: {
      episode: nextEpisodeId,
      translation: currentTranslationId,
    },
    translations,
    startTranslation,
  };

  const video = await getVideo(startTranslation.id);

  /**
   * Необходимо заново проверить {@link nextEpisodeId} и {@link currentTranslationId}
   * так как за время асинхронного запроса {@link nextEpisode} или {@link currentTranslation} могли изменится
   */
  if (!video || nextEpisodeId !== nextEpisode.value?.id || currentTranslationId !== currentTranslation.value?.id) {
    return;
  }

  nextEpisodeMetadata.video = video;

  /**
   * Тег `<video>` вставляемый в `<head>` чтобы браузер загрузил метаданные
   */
  let preloadMetadataTag = document.head.querySelector<HTMLVideoElement>('#preloadMetadataTag');
  if (preloadMetadataTag === null) {
    preloadMetadataTag = document.createElement('video');
    preloadMetadataTag.id = 'preloadMetadataTag';
    preloadMetadataTag.crossOrigin = 'anonymous';
    preloadMetadataTag.preload = 'metadata';
    document.head.appendChild(preloadMetadataTag);
  }
  const maxQuality = Math.max(...video.qualities.keys());
  preloadMetadataTag.onerror = () => {
    if (nextEpisodeMetadata) delete nextEpisodeMetadata.video;
  };
  preloadMetadataTag.src = video.qualities.get(maxQuality) || '';
};


const goToNextEpisode = () => {
  if (!nextEpisode.value) {
    return;
  }

  if (nextEpisodeMetadata?.translations?.length && nextEpisodeMetadata?.startTranslation) {
    doNotUpdateEpisodes(() => currentEpisode.value = nextEpisode.value || undefined);

    translations.value = nextEpisodeMetadata.translations;

    if (nextEpisodeMetadata.video) {
      doNotUpdateVideos(() => currentTranslation.value = nextEpisodeMetadata?.startTranslation);
      video.value = nextEpisodeMetadata.video;
    } else {
      currentTranslation.value = nextEpisodeMetadata.startTranslation;
    }
  } else {
    currentEpisode.value = nextEpisode.value;
  }
};


/**
 * Позиция просмотра текущей серии
 */
const historyItem = ref<HistoryViewsItem | null>(null);
getViewHistoryItem(Number(props.seriesId), false).then(item => {
  historyItem.value = item || null;
});


/**
 * Сохраняет серию и прогресс просмотр серии
 */
const videoProgressHandler = useDebounceFn(({
                                              duration,
                                              currentTime,
                                            }: { duration?: number, currentTime?: number } = {}) => {
  if (!duration || !currentTime || !currentEpisode.value) {
    return;
  }

  historyItem.value = {
    seriesId: Number(props.seriesId),
    episode: {
      number: currentEpisode.value.number,
      time: currentTime,
      duration: duration,
    },
  };

  putHistoryItem(toRaw(historyItem.value));

  if (isEpisodeCompleted(currentTime, duration)) {
    updateNextEpisodeMetadata();
  }
}, SECOND_MS);


/**
 * Загрузка подробной информации об открытом Аниме
 */
const series = asyncComputed(() => getSeries(Number(props.seriesId)));

/**
 * Изменение заголовка страниц
 */
useTitle(computed(() => series.value?.title || DEFAULT_PAGE_TITLE));

/**
 * Media Session Metadata
 */
useMediaSessionMetadata(computed(() => {
  return series.value && currentEpisode.value
    ? {
      title: currentEpisode.value?.title,
      artist: series.value.title,
      artwork: series.value.poster ? [{src: series.value.poster}] : [],
    }
    : null;
}));


/**
 * Отвечает за видимость кнопки плейлистов
 */
const isSidePanelOpened = ref(false);
</script>


<template>
  <main class="position-relative">
    <video-player
      id="video-container"
      :video="video"
      :has-next-episode="!!nextEpisode"
      :start-from="historyItem ? (historyItem.episode.time && historyItem.episode.number === currentEpisode?.number ? historyItem.episode.time : 0) : 0"
      @goToNextEpisode="goToNextEpisode"
      @progress="videoProgressHandler"
      @source-error="onSourceError"
    >
      <template #header>
        <header class="position-absolute top-0 text-white w-100 p-3 d-flex align-items-start">
          <h2
            v-if="currentEpisode && (currentEpisodeMeta || currentEpisode.title)"
            class="h5 flex-fill m-0 fw-normal"
          >
            {{ currentEpisodeMeta ? currentEpisode.number + '. ' + currentEpisodeMeta.title : currentEpisode.title }}

            <small
              v-if="currentEpisodeMeta?.filler"
              class="badge bg-danger"
            >filler</small>

            <small
              v-if="currentEpisodeMeta?.recap"
              class="badge bg-info text-dark"
            >recap</small>
          </h2>
          <button
            v-if="episodes.length > 1 || translations.length"
            title="Выбор эпизода и перевода"
            aria-label="Выбор эпизода и перевода"
            class="open-playlist btn btn-dark ignore-prefers-color-scheme win-icon border-0 bg-transparent"
            @click="isSidePanelOpened = !isSidePanelOpened"
          >
            &#xE8FD;
          </button>
        </header>
      </template>

      <template #default>
        <side-panel
          v-if="isSidePanelOpened && (episodes.length > 1 || translations.length)"
          class="playlist-side-panel"
          :default-state="true"
          @close="isSidePanelOpened = false"
        >
          <tabs-section default-active-slot="translations">
            <template #tab-header="{tabName, isActive, activate}">
              <input
                :id="`${tabName}-tab-header`"
                value="episodes"
                type="radio"
                class="btn-check"
                name="active-tab"
                autocomplete="off"
                :checked="isActive"
                @input="activate"
              >
              <label
                class="btn rounded-0"
                :for="`${tabName}-tab-header`"
              >
                <span
                  class="border-initial px-2 pb-2"
                  :class="{'border-bottom': isActive}"
                >
                  {{ tabName === 'episodes' ? 'Эпизоды' : tabName === 'translations' ? 'Переводы' : tabName }}
                </span>
              </label>
            </template>
            <template
              v-if="episodes.length > 1"
              #episodes
            >
              <episodes-list
                v-model:currentEpisode="currentEpisode"
                :series-id="Number(seriesId)"
                :episodes="episodes"
              />
            </template>

            <template
              v-if="translations.length && currentEpisode !== undefined"
              #translations
            >
              <translations-list
                v-model:currentTranslation="currentTranslation"
                :series-id="Number(seriesId)"
                :translations="translations"
              />
            </template>
          </tabs-section>
        </side-panel>
      </template>
    </video-player>
    <p
      v-if="error"
      class="error-box text-danger position-absolute text-center w-100 fw-bold lead m-0 py-2"
    >
      {{ error }}
      <br>
      <button
        class="btn btn-link"
        @click="reloadPage"
      >
        Повторить попытку
      </button>
    </p>
  </main>
</template>


<style scoped>

main {
  background-color: black;
}

header {
  --offset-top: 1rem;
  --offset-right: 1rem;
  background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 83%);
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

.playlist-side-panel {
  -webkit-app-region: no-drag;
}

.border-initial {
  border-color: initial;
}

.error-box {
  top: 50%;
  transform: translateY(-50%);
  background: #000;
}
</style>
