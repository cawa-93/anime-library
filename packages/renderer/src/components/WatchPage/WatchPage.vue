<template>
  <video-player
    id="video-container"
    :videos="videos"
    :next-url="nextEpisodeURL"
    :start-from="startFrom"
    @source-error="onSourceError"
    @progress="saveWatchProgress"
  >
    <div>
      <button
        v-if="showEpisodesPanel || showTranslationsPanel"
        title="Выбор эпизода и перевода"
        class="open-playlist btn btn-dark win-icon border-0 p-0"
        @click="isSidePanelOpened = !isSidePanelOpened"
      >
        &#xE8FD;
      </button>
      <side-panel
        v-if="isSidePanelOpened && (showEpisodesPanel || showTranslationsPanel)"
        v-model:is-opened="isSidePanelOpened"
      >
        <div
          class="btn-group d-flex"
          role="group"
          aria-label="Basic radio toggle button group"
        >
          <input
            id="episodes-tab"
            v-model="sidePanelActiveTab"
            value="episodes"
            type="radio"
            class="btn-check"
            name="active-tab"
            autocomplete="off"
            checked
          >
          <label
            class="btn rounded-0"
            for="episodes-tab"
          >
            <span
              class="border-dark px-2 pb-2"
              :class="{'border-bottom': sidePanelActiveTab ==='episodes'}"
            >Эпизоды</span>
          </label>

          <input
            id="translations-tab"
            v-model="sidePanelActiveTab"
            value="translations"
            type="radio"
            class="btn-check"
            name="active-tab"
            autocomplete="off"
          >
          <label
            class="btn rounded-0"
            for="translations-tab"
          >
            <span
              class="border-dark px-2 pb-2"
              :class="{'border-bottom': sidePanelActiveTab ==='translations'}"
            >Переводы</span>
          </label>
        </div>

        <episodes-list
          v-if="showEpisodesPanel && sidePanelActiveTab === 'episodes'"
          :episodes="episodes"
        />
        <translations-list
          v-if="showTranslationsPanel && sidePanelActiveTab === 'translations' && selectedEpisode"
          :selected-episode-num="selectedEpisode.number"
          :translations="translations"
        />
      </side-panel>
    </div>
  </video-player>
</template>

<script lang="ts">
import {asyncComputed, useThrottleFn, useTitle} from '@vueuse/core';
import type {DeepReadonly} from 'vue';
import {computed, defineComponent, ref, watch} from 'vue';
import type {Episode, Translation, Video} from '/@/utils/videoProvider';
import {clearVideosCache, getEpisodes, getSeries, getTranslations, getVideos} from '/@/utils/videoProvider';
import SidePanel from '/@/components/WatchPage/SidePanel.vue';
import EpisodesList from '/@/components/WatchPage/EpisodesList.vue';
import TranslationsList from '/@/components/WatchPage/TranslationsList.vue';
import VideoPlayer from '/@/components/WatchPage/VideoPlayer/VideoPlayer.vue';
import {useRouter} from 'vue-router';
import {showErrorMessage} from '/@/utils/dialogs';
import {getPreferredTranslationFromList} from '/@/utils/translationRecomendations';
import {getViewHistoryItem, putHistoryItem} from '/@/utils/history-views';



export default defineComponent({
  components: {VideoPlayer, TranslationsList, EpisodesList, SidePanel},
  props: {
    seriesId: {
      type: Number,
      required: true,
    },
    episodeNum: {
      type: Number,
      required: true,
    },
    translationId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();


    // Эпизоды
    const episodes = asyncComputed(() => getEpisodes(props.seriesId), [] as Episode[]);

    const selectedEpisode = computed(() => episodes.value.find(e => e.number == props.episodeNum));

    const nextEpisodeURL = ref<string>();
    const prepareNextEpisode = async () => {
      const nextEpisode = episodes.value[episodes.value.findIndex(e => e === selectedEpisode.value) + 1];
      if (nextEpisode === undefined) {
        nextEpisodeURL.value = undefined;
        return;
      }

      const nextEpisodeTranslations = await getTranslations(nextEpisode.id);
      if (!nextEpisodeTranslations.length) {
        nextEpisodeURL.value = undefined;
        return;
      }

      const nextEpisodePreferredTranslations = await getPreferredTranslationFromList(props.seriesId, nextEpisodeTranslations as Translation[]);

      const translationId = nextEpisodePreferredTranslations?.id || nextEpisodeTranslations[0].id;


      const resolvedNextPageUrl = router.resolve({params: {episodeNum: nextEpisode.number, translationId}});
      nextEpisodeURL.value = resolvedNextPageUrl.href ? resolvedNextPageUrl.href : undefined;

      // if (import.meta.env.MODE !== 'development') {
      //   // Если удалось определить перевод для следующей серии -- выполнить загрузку видео, чтобы кэшировать их
      //   await getVideos(translationId);
      //   // TODO: Начать загрузку непосредственно целевого видео-файла для следующего эпизода
      // }
    };

    watch(selectedEpisode, prepareNextEpisode);

    // Доступные переводы
    const translations = ref<DeepReadonly<Translation[]>>([]);
    watch(selectedEpisode, async () => {
      if (!selectedEpisode.value?.id) {
        return;
      }
      translations.value = [];
      translations.value = await getTranslations(selectedEpisode.value.id);
    });

    const selectedTranslation = computed(() => translations.value.find(e => e.id === props.translationId));


    // Загрузка доступных видео для выбранного перевода
    const videos = ref<DeepReadonly<Video[]>>([]);
    const loadVideoSources = useThrottleFn((): void => {
      videos.value = [];

      if (!selectedTranslation.value?.id) {
        return;
      }

      getVideos(selectedTranslation.value.id)
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

          return [] as DeepReadonly<Video[]>;
        })
        .then(v => videos.value = v);
    }, 1000);

    loadVideoSources();


    watch(selectedTranslation, loadVideoSources);

    const onSourceError = () => {
      if (!selectedTranslation.value) {
        return;
      }

      return clearVideosCache(selectedTranslation.value.id).then(loadVideoSources);
    };

    const isSidePanelOpened = ref(false);
    const sidePanelActiveTab = ref<'episodes' | 'translations'>('translations');
    const showEpisodesPanel = computed(() => episodes.value.length > 1);
    const showTranslationsPanel = computed(() => selectedEpisode.value !== undefined && translations.value.length > 0);



    // Информация про само аниме
    const series = asyncComputed(() => getSeries(props.seriesId), undefined);
    watch([series, selectedEpisode, selectedTranslation], () => {
      if (!series.value) {
        if (navigator.mediaSession !== undefined) {
          navigator.mediaSession.metadata = null;
        }

        return;
      }

      if (navigator.mediaSession !== undefined) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: selectedEpisode.value?.title || '',
          artist: series.value.title,
          artwork: [
            {src: series.value.poster || ''},
          ],
        });
      }
    });


    //
    // Заголовок страницы
    const t = useTitle();
    watch([series, selectedEpisode, selectedTranslation], () => {
      const titleChunks = [
        series.value?.title,
        episodes.value.length > 1 ? selectedEpisode.value?.title : null,
        translations.value.length > 1 ? selectedTranslation.value?.title : null,
      ];
      t.value = titleChunks.filter(s => !!s).join(', ');
    });


    //
    // Сохранение и восстановление позиции просмотра
    const startFrom = ref(0);
    getViewHistoryItem(props.seriesId, false).then(historyItem => {
      if (historyItem?.episode.number === props.episodeNum && historyItem.episode.time) {
        startFrom.value = historyItem.episode.time;
      }
    });
    const saveWatchProgress = ({duration, currentTime}: { duration?: number, currentTime?: number } = {}) => {
      if (!duration || !currentTime || !selectedEpisode.value) {
        return;
      }

      startFrom.value = currentTime;

      putHistoryItem({
        seriesId: props.seriesId,
        episode: {
          number: selectedEpisode.value.number,
          time: currentTime,
          duration: duration,
        },
      });
    };

    // При изменении серии -- сбросить позицию просмотра
    watch(selectedEpisode, (oldValue, newValue) => {
      if (oldValue?.number && newValue?.number && oldValue.number !== newValue.number) {
        startFrom.value = 0;
      }
    });

    return {
      startFrom,
      saveWatchProgress,
      onSourceError,
      nextEpisodeURL,
      episodes,
      selectedEpisode,
      translations,
      videos,
      isSidePanelOpened,
      sidePanelActiveTab,
      showEpisodesPanel,
      showTranslationsPanel,
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
