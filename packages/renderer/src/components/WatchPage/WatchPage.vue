<template>
  <main class="position-relative">
    <p
      v-if="error"
      class="text-danger position-absolute top-50 text-center w-100 fw-bold lead"
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
    <template v-else>
      <video-player
        v-if="videos.length"
        id="video-container"
        :videos="videos"
        :has-next-episode="!!nextEpisode"
        :start-from="historyItem ? (historyItem.episode.time && historyItem.episode.number === currentEpisode?.number ? historyItem.episode.time : 0) : 0"
        @goToNextEpisode="goToNextEpisode"
        @progress="videoProgressHandler"
        @source-error="onSourceError"
        @controls-visibility-change="v => {isPlaylistButtonVisible = v; isSidePanelOpened = false}"
      />
      <loading-spinner v-if="videos.length === 0" />
    </template>

    <transition name="fade">
      <header
        v-if="isPlaylistButtonVisible"
        class="position-absolute top-0 text-white w-100 p-3 d-flex align-items-start"
      >
        <h2
          v-if="currentEpisode && currentEpisode.title"
          class="h5 flex-fill m-0 fw-normal"
        >
          {{ currentEpisode.title }}
        </h2>
        <button
          v-if="episodes.length > 1 || translations.length"
          title="Выбор эпизода и перевода"
          class="open-playlist btn btn-dark win-icon border-0 bg-transparent"
          @click="isSidePanelOpened = !isSidePanelOpened"
        >
          &#xE8FD;
        </button>
      </header>
    </transition>

    <side-panel
      v-if="isSidePanelOpened && isPlaylistButtonVisible && (episodes.length > 1 || translations.length)"
      :default-state="true"
      @close="isSidePanelOpened = false"
    >
      <tabs-section default-tab="translations">
        <template #tab-header="{tabName, isActive, select}">
          <input
            :id="`${tabName}-tab-header`"
            value="episodes"
            type="radio"
            class="btn-check"
            name="active-tab"
            autocomplete="off"
            :checked="isActive"
            @input="select"
          >
          <label
            class="btn rounded-0"
            :for="`${tabName}-tab-header`"
          >
            <span
              class="border-dark px-2 pb-2"
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
  </main>
</template>

<script lang="ts">
import {computed, defineComponent, ref, toRaw, watch} from 'vue';
import type {Episode, Translation, Video} from '/@/utils/videoProvider';
import {clearVideosCache, getSeries, getVideos} from '/@/utils/videoProvider';
import SidePanel from '/@/components/SidePanel.vue';
import EpisodesList from '/@/components/WatchPage/EpisodesList.vue';
import TranslationsList from '/@/components/WatchPage/TranslationsList.vue';
import VideoPlayer from '/@/components/WatchPage/VideoPlayer/VideoPlayer.vue';
import {getEpisodesList, getTranslationsList} from '/@/utils/prepareWatchData';
import TabsSection from '/@/components/TabsSection.vue';
import type {HistoryViewsItem} from '/@/utils/history-views';
import {getViewHistoryItem, putHistoryItem} from '/@/utils/history-views';
import {ignorableWatch, useThrottleFn} from '@vueuse/core';
import {showErrorMessage} from '/@/utils/dialogs';
import LoadingSpinner from '/@/components/LoadingSpinner.vue';
import {SECOND_MS} from '/@/utils/time';
import {isEpisodeCompleted} from '/@/utils/isEpisodeCompleted';



export default defineComponent({
  components: {LoadingSpinner, TabsSection, VideoPlayer, TranslationsList, EpisodesList, SidePanel},
  props: {
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
  },
  setup(props) {
    document.title = 'Просмотр аниме';
    const error = ref('');
    const reloadPage = () => {
      location.pathname = `/watch/${props.seriesId}`;
    };


    /**
     * Загрузка серий
     */
    const episodes = ref<Episode[]>([]);
    const currentEpisode = ref<Episode | undefined>();
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
    const videos = ref<Video[]>([]);

    const loadVideoSources = useThrottleFn(async (selectedTranslationId: number, force = false) => {
      videos.value = [];
      error.value = '';
      if (force) {
        await clearVideosCache(selectedTranslationId);
      }

      getVideos(selectedTranslationId)
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

          return [] as Video[];
        })
        .then(v => {
          if (v.length === 0) {
            error.value = 'Нет загруженных видео. Попробуйте выбрать другой перевод';
            return;
          }

          videos.value = v;
        });
    }, SECOND_MS);


    const {ignoreUpdates: doNotUpdateVideos} = ignorableWatch(currentTranslation, (currentTranslation, oldCurrentTranslation) => {
      if (currentTranslation && oldCurrentTranslation && currentTranslation.id === oldCurrentTranslation.id) {
        return;
      }

      videos.value = [];

      if (!currentTranslation) {
        return;
      }

      loadVideoSources(currentTranslation.id);
    }, {immediate: true});

    const onSourceError = () => {
      if (!currentTranslation.value) {
        return;
      }

      return loadVideoSources(currentTranslation.value.id, true);
    };


    /**
     * Подготовка следующей серии
     */
    const nextEpisode = computed(() => {
      if (!currentEpisode.value) {
        return;
      }

      let minEpisodeByNum: Episode | undefined = undefined;
      for (const e of episodes.value) {
        if (e.number <= currentEpisode.value.number) {
          continue;
        }

        if (minEpisodeByNum === undefined || minEpisodeByNum.number > e.number) {
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
      videos?: Video[]
    } | null = null;

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

      const videos = await getVideos(startTranslation.id);

      /**
       * Необходимо заново проверить {@link nextEpisodeId} и {@link currentTranslationId}
       * так как за время асинхронного запроса {@link nextEpisode} или {@link currentTranslation} могли изменится
       */
      if (!videos.length || nextEpisodeId !== nextEpisode.value?.id || currentTranslationId !== currentTranslation.value?.id) {
        return;
      }

      nextEpisodeMetadata.videos = videos;
      let preloadMetadataTag = document.head.querySelector<HTMLVideoElement>('#preloadMetadataTag');
      if (preloadMetadataTag === null) {
        preloadMetadataTag = document.createElement('video');
        preloadMetadataTag.id = 'preloadMetadataTag';
        preloadMetadataTag.crossOrigin = 'anonymous';
        preloadMetadataTag.preload = 'metadata';
        document.head.appendChild(preloadMetadataTag);
      }
      const maxQuality = videos.reduce((pv, cv) => cv.quality > pv.quality ? cv : pv, videos[0]);
      preloadMetadataTag.onerror = () => {
        if (nextEpisodeMetadata) delete nextEpisodeMetadata.videos;
      };
      preloadMetadataTag.src = maxQuality.sources[0].src;
    };


    const goToNextEpisode = () => {
      if (!nextEpisode.value) {
        return;
      }

      if (nextEpisodeMetadata?.translations?.length && nextEpisodeMetadata?.startTranslation) {
        doNotUpdateEpisodes(() => currentEpisode.value = nextEpisode.value);

        translations.value = nextEpisodeMetadata.translations;

        if (nextEpisodeMetadata.videos?.length) {
          doNotUpdateVideos(() => currentTranslation.value = nextEpisodeMetadata?.startTranslation);
          videos.value = nextEpisodeMetadata.videos;
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
    const historyItem = ref<HistoryViewsItem | undefined>();
    getViewHistoryItem(Number(props.seriesId), false).then(item => {
      historyItem.value = item;
    });


    /**
     * Сохранение позиции просмотра
     */
    const videoProgressHandler = ({duration, currentTime}: { duration?: number, currentTime?: number } = {}) => {
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
    };


    /**
     * Загрузка подробной информации об открытом Аниме
     * Необходимо для заголовка окна
     */
    getSeries(Number(props.seriesId)).then(series => {
      if (series && series.title) {
        document.title = series.title;
      }
    });


    /**
     * Отвечает за видимость кнопки плейлистов
     * Синхронизируется с состоянием видимости панели управления видео
     */
    const isPlaylistButtonVisible = ref(true);

    const isSidePanelOpened = ref(false);
    return {
      isSidePanelOpened,
      error,
      reloadPage,
      episodes,
      currentEpisode,
      translations,
      currentTranslation,
      videos,
      goToNextEpisode,
      nextEpisode,
      historyItem,
      videoProgressHandler,
      onSourceError,
      isPlaylistButtonVisible,
    };
  },
});
</script>

<style scoped>

main {
  background-color: black;
}

header {
  --offset-top: 1rem;
  --offset-right: 1rem;
  background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 83%);
  padding: var(--offset-top) var(--offset-right) 100px var(--offset-right);
  pointer-events: none;
}

header h2 {
  text-shadow: 0 0 5px black;
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
