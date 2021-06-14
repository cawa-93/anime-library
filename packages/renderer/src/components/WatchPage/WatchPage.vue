<template>
  <main class="position-relative">
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

    <video-player
      id="video-container"
      :videos="videos"
      :has-next-episode="!!nextEpisode"
      :start-from="historyItem ? (historyItem.episode.time && historyItem.episode.number === currentEpisode?.number ? historyItem.episode.time : 0) : 0"
      @goToNextEpisode="goToNextEpisode"
      @progress="saveWatchProgress"
      @source-error="onSourceError"
    />
  </main>
</template>

<script lang="ts">
import {computed, defineComponent, ref, toRaw, watch} from 'vue';
import type {Episode, Video} from '/@/utils/videoProvider';
import {clearVideosCache, getVideos} from '/@/utils/videoProvider';
import SidePanel from '/@/components/SidePanel.vue';
import EpisodesList from '/@/components/WatchPage/EpisodesList.vue';
import TranslationsList from '/@/components/WatchPage/TranslationsList.vue';
import VideoPlayer from '/@/components/WatchPage/VideoPlayer/VideoPlayer.vue';
import {getEpisodesList} from '/@/utils/prepareWatchData';
import TabsSection from '/@/components/TabsSection.vue';
import useTranslations from '/@/use/useTranslations';
import type {HistoryViewsItem} from '/@/utils/history-views';
import {getViewHistoryItem, putHistoryItem} from '/@/utils/history-views';
import {useThrottleFn} from '@vueuse/core';
import {showErrorMessage} from '/@/utils/dialogs';



export default defineComponent({
  components: {TabsSection, VideoPlayer, TranslationsList, EpisodesList, SidePanel},
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



    /**
     * Загрузка серий
     */
    const episodes = ref<Episode[]>([]);
    const currentEpisode = ref<Episode | undefined>();
    watch(() => props.seriesId, (seriesId, oldSeriesId) => {

      if (seriesId === oldSeriesId) {
        return;
      }

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
    const {
      translations,
      startTranslation: currentTranslation,
    } = useTranslations(currentEpisode, props.seriesId, props.translationId);



    /**
     * Загрузка видео
     */
    const videos = ref<Video[]>([]);

    const loadVideoSources = useThrottleFn(async (selectedTranslationId: number, force = false) => {
      videos.value = [];

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
        .then(v => videos.value = v);
    }, 1000);


    watch(currentTranslation, (currentTranslation, oldCurrentTranslation) => {
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


    const goToNextEpisode = () => {
      if (!nextEpisode.value) {
        return;
      }

      currentEpisode.value = nextEpisode.value;
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

    return {
      error,
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
    };
  },
});
</script>

<style scoped>
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
