<template>
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

  <!--      :start-from="startFrom"-->
  <!--      @source-error="onSourceError"-->
  <!--      @progress="saveWatchProgress"-->
  <video-player
    id="video-container"
    :videos="videos"
    :has-next-episode="!!nextEpisode"
    @goToNextEpisode="goToNextEpisode"
  />
</template>

<script lang="ts">
import {computed, defineComponent, ref, watch} from 'vue';
import type {Episode, Video} from '/@/utils/videoProvider';
import {getVideos} from '/@/utils/videoProvider';
import SidePanel from '/@/components/SidePanel.vue';
import EpisodesList from '/@/components/WatchPage/EpisodesList.vue';
import TranslationsList from '/@/components/WatchPage/TranslationsList.vue';
import VideoPlayer from '/@/components/WatchPage/VideoPlayer/VideoPlayer.vue';
import {getEpisodesList} from '/@/utils/prepareWatchData';
import TabsSection from '/@/components/TabsSection.vue';
import {useRoute} from 'vue-router';
import useTranslations from '/@/use/useTranslations';



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
    const route = useRoute();
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
        console.debug('[getEpisodesList]', data);
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
    watch(currentTranslation, (currentTranslation, oldCurrentTranslation) => {
      if (currentTranslation && oldCurrentTranslation && currentTranslation.id === oldCurrentTranslation.id) {
        return;
      }

      videos.value = [];

      if (!currentTranslation) {
        return;
      }

      getVideos(currentTranslation.id).then(v => {
        videos.value = v;
      });
    }, {immediate: true});


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

    return {
      error,
      episodes,
      currentEpisode,
      translations,
      currentTranslation,
      videos,
      goToNextEpisode,
      nextEpisode,
      route,
    };


    // const router = useRouter();
    //
    // // Эпизоды
    // const episodes = asyncComputed(() => getEpisodes(props.seriesId), [] as Episode[]);
    //
    // const selectedEpisode = computed(() => episodes.value.find(e => e.number == props.episodeNum));
    //
    // const nextEpisodeURL = ref<string>();
    // const prepareNextEpisode = async () => {
    //   const nextEpisode = episodes.value[episodes.value.findIndex(e => e === selectedEpisode.value) + 1];
    //   if (nextEpisode === undefined) {
    //     nextEpisodeURL.value = undefined;
    //     return;
    //   }
    //
    //   const nextEpisodeTranslations = await getTranslations(nextEpisode.id);
    //   if (!nextEpisodeTranslations.length) {
    //     nextEpisodeURL.value = undefined;
    //     return;
    //   }
    //
    //   const nextEpisodePreferredTranslations = await getPreferredTranslationFromList(props.seriesId, nextEpisodeTranslations as Translation[]);
    //
    //   const translationId = nextEpisodePreferredTranslations?.id || nextEpisodeTranslations[0].id;
    //
    //
    //   const resolvedNextPageUrl = router.resolve({params: {episodeNum: nextEpisode.number, translationId}});
    //   nextEpisodeURL.value = resolvedNextPageUrl.href ? resolvedNextPageUrl.href : undefined;
    //
    //   // if (import.meta.env.MODE !== 'development') {
    //   //   // Если удалось определить перевод для следующей серии -- выполнить загрузку видео, чтобы кэшировать их
    //   //   await getVideos(translationId);
    //   //   // TODO: Начать загрузку непосредственно целевого видео-файла для следующего эпизода
    //   // }
    // };
    //
    // watch(selectedEpisode, prepareNextEpisode, {immediate: true});
    //
    // // Доступные переводы
    // const translations = ref<DeepReadonly<Translation[]>>([]);
    // watch(selectedEpisode, async () => {
    //   if (!selectedEpisode.value?.id) {
    //     return;
    //   }
    //   translations.value = [];
    //   translations.value = await getTranslations(selectedEpisode.value.id);
    // }, {immediate: true});
    //
    // const selectedTranslation = computed(() => translations.value.find(e => e.id === props.translationId));
    //
    //
    // // Загрузка доступных видео для выбранного перевода
    // const videos = ref<DeepReadonly<Video[]>>([]);
    // const loadVideoSources = useThrottleFn((): void => {
    //   videos.value = [];
    //
    //   if (!selectedTranslation.value?.id) {
    //     return;
    //   }
    //
    //   getVideos(selectedTranslation.value.id)
    //     .catch((err) => {
    //
    //       const title = 'Не удалось загрузить видео с Anime.365';
    //       const message: string = err.code === 403
    //         ? 'Перейдите в настройки и обновите ключ доступа'
    //         : err.message !== undefined
    //           ? err.message
    //           : typeof err === 'string'
    //             ? err
    //             : JSON.stringify(err);
    //
    //       showErrorMessage({title, message});
    //
    //       return [] as DeepReadonly<Video[]>;
    //     })
    //     .then(v => videos.value = v);
    // }, 1000);
    //
    // watch(selectedTranslation, loadVideoSources, {immediate: true});
    //
    // const onSourceError = () => {
    //   if (!selectedTranslation.value) {
    //     return;
    //   }
    //
    //   return clearVideosCache(selectedTranslation.value.id).then(loadVideoSources);
    // };
    //
    // const isSidePanelOpened = ref(false);
    // const sidePanelActiveTab = ref<'episodes' | 'translations'>('translations');
    // const showEpisodesPanel = computed(() => episodes.value.length > 1);
    // const showTranslationsPanel = computed(() => selectedEpisode.value !== undefined && translations.value.length > 0);
    //
    //
    //
    // // Информация про само аниме
    // const series = asyncComputed(() => getSeries(props.seriesId), undefined);
    // watch([series, selectedEpisode, selectedTranslation], () => {
    //   if (!series.value) {
    //     if (navigator.mediaSession !== undefined) {
    //       navigator.mediaSession.metadata = null;
    //     }
    //
    //     return;
    //   }
    //
    //   if (navigator.mediaSession !== undefined) {
    //     navigator.mediaSession.metadata = new MediaMetadata({
    //       title: selectedEpisode.value?.title || '',
    //       artist: series.value.title,
    //       artwork: [
    //         {src: series.value.poster || ''},
    //       ],
    //     });
    //   }
    // });
    //
    //
    // //
    // // Заголовок страницы
    // const t = useTitle();
    // watch([series, selectedEpisode, selectedTranslation], () => {
    //   const titleChunks = [
    //     series.value?.title,
    //     episodes.value.length > 1 ? selectedEpisode.value?.title : null,
    //     translations.value.length > 1 ? selectedTranslation.value?.title : null,
    //   ];
    //   t.value = titleChunks.filter(s => !!s).join(', ');
    // }, {immediate: true});
    //
    //
    // //
    // // Сохранение и восстановление позиции просмотра
    // const startFrom = ref(0);
    // getViewHistoryItem(props.seriesId, false).then(historyItem => {
    //   if (historyItem?.episode.number === props.episodeNum && historyItem.episode.time) {
    //     startFrom.value = historyItem.episode.time;
    //   }
    // });
    // const saveWatchProgress = ({duration, currentTime}: { duration?: number, currentTime?: number } = {}) => {
    //   if (!duration || !currentTime || !selectedEpisode.value) {
    //     return;
    //   }
    //
    //   startFrom.value = currentTime;
    //
    //   putHistoryItem({
    //     seriesId: props.seriesId,
    //     episode: {
    //       number: selectedEpisode.value.number,
    //       time: currentTime,
    //       duration: duration,
    //     },
    //   });
    // };
    //
    // // При изменении серии -- сбросить позицию просмотра
    // watch(selectedEpisode, (oldValue, newValue) => {
    //   if (oldValue?.number && newValue?.number && oldValue.number !== newValue.number) {
    //     startFrom.value = 0;
    //   }
    // });
    //
    // return {
    //   startFrom,
    //   saveWatchProgress,
    //   onSourceError,
    //   nextEpisodeURL,
    //   episodes,
    //   selectedEpisode,
    //   translations,
    //   videos,
    //   isSidePanelOpened,
    //   sidePanelActiveTab,
    //   showEpisodesPanel,
    //   showTranslationsPanel,
    // };
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
