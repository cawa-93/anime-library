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
        @progress="saveWatchProgress"
        @source-error="onSourceError"
      />
      <loading-spinner v-if="videos.length === 0" />
    </template>

    <side-panel
      v-if="episodes.length > 1 || translations.length"
    >
      <template #activator="{toggle}">
        <button
          title="Выбор эпизода и перевода"
          class="open-playlist btn btn-dark win-icon border-0 p-0"
          @click="toggle"
        >
          &#xE8FD;
        </button>
      </template>

      <tabs-section>
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
import {clearVideosCache, getVideos} from '/@/utils/videoProvider';
import SidePanel from '/@/components/SidePanel.vue';
import EpisodesList from '/@/components/WatchPage/EpisodesList.vue';
import TranslationsList from '/@/components/WatchPage/TranslationsList.vue';
import VideoPlayer from '/@/components/WatchPage/VideoPlayer/VideoPlayer.vue';
import {getEpisodesList, getTranslationsList} from '/@/utils/prepareWatchData';
import TabsSection from '/@/components/TabsSection.vue';
import type {HistoryViewsItem} from '/@/utils/history-views';
import {getViewHistoryItem, putHistoryItem} from '/@/utils/history-views';
import {ignorableWatch, useDebounceFn, useThrottleFn} from '@vueuse/core';
import {showErrorMessage} from '/@/utils/dialogs';
import LoadingSpinner from '/@/components/LoadingSpinner.vue';
import {MINUTE, SECOND} from '/@/utils/time';



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

      getEpisodesList(seriesId, props.episodeNum === '' ? undefined : props.episodeNum).then(data => {
        const {episodes: eps, startEpisode} = data;

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


      getTranslationsList(currentEpisode.id, props.seriesId, !props.translationId ? undefined : props.translationId).then(data => {
        const {translations: trs, startTranslation} = data;

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

    // const {
    //   translations,
    //   startTranslation: currentTranslation,
    //   error: translationError,
    // } = useTranslations(currentEpisode, props.seriesId, props.translationId);
    // watch(translationError, translationError => error.value = translationError);

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
    }, SECOND);


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
      translations?: Translation[],
      startTranslation?: Translation,
      videos?: Video[]
    } | null = null;

    const updateNextEpisodeMetadata = useDebounceFn(async () => {
      if (!nextEpisode.value?.id) {
        return;
      }

      const {translations, startTranslation} = await getTranslationsList(nextEpisode.value.id, props.seriesId);

      if (startTranslation) {
        nextEpisodeMetadata = {
          translations,
          startTranslation,
        };

        const videos = await getVideos(startTranslation.id);
        if (videos.length) {
          nextEpisodeMetadata.videos = videos;

          // Нужно вставить тег `<video preload="metadata">` в документ, чтобы пред загрузить метаданные для видео следующей серии
          // Это необходимо для быстрого переключения серий
          // Для пред загрузки выбирается источник с максимальным качеством
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
        }
      }
    }, MINUTE);

    watch(currentTranslation, () => {
      nextEpisodeMetadata = null;
      updateNextEpisodeMetadata();
    });


    const goToNextEpisode = () => {
      if (!nextEpisode.value) {
        return;
      }

      if (nextEpisodeMetadata && nextEpisodeMetadata.translations?.length && nextEpisodeMetadata.startTranslation) {
        doNotUpdateEpisodes(() => currentEpisode.value = nextEpisode.value);

        translations.value = nextEpisodeMetadata.translations;

        if (nextEpisodeMetadata.videos?.length) {
          doNotUpdateVideos(() => currentTranslation.value = nextEpisodeMetadata!.startTranslation);
          videos.value = nextEpisodeMetadata.videos;
        } else {
          currentTranslation.value = nextEpisodeMetadata.startTranslation;
        }
      } else {
        currentEpisode.value = nextEpisode.value;
      }

      // currentEpisode.value = nextEpisode.value;
      // videos.value = nextEpisodeMetadata.videos;
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
    const saveWatchProgress = ({duration, currentTime}: { duration?: number, currentTime?: number } = {}) => {
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
    };



    const videoPlayerWaiting = ref(true);

    return {
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
      saveWatchProgress,
      onSourceError,
      videoPlayerWaiting,
    };
  },
});
</script>

<style scoped>

main {
  background-color: black;
}

#video-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: black;
}


#video-container video {
  width: 100%;
  height: 100%;
}

.open-playlist.btn {
  --offset-top: 0.3em;
  --offset-right: 0.3em;
  position: absolute;
  top: var(--offset-top);
  right: var(--offset-right);
  mix-blend-mode: difference;
  font-size: 18px;
  width: 2em;
  height: 2em;
  line-height: 1;
  z-index: 10;
}

.open-playlist.btn:before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  height: calc(100% + var(--offset-top));
  width: calc(100% + var(--offset-right));
}

.open-playlist.btn:not(:hover) {
  background-color: transparent;
}

.btn-group input:not(:checked) + label:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
