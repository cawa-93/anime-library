<template>
  <video-player
    id="video-container"
    :videos="videos"
    :next-url="nextEpisodeURL"
    @source-error="onSourceError"
    @durationchange="saveWatchProgress"
    @progress="saveWatchProgress"
  >
    <div>
      <button
        v-if="showEpisodesPanel || showTranslationsPanel"
        title="Выбор эпизода и перевода"
        class="open-playlist btn btn-dark border-0 p-0"
        @click="isSidePanelOpened = !isSidePanelOpened"
      >
        <win-icon>
          &#xE8FD;
        </win-icon>
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
import {asyncComputed, useTitle} from '@vueuse/core';
import type {DeepReadonly} from 'vue';
import {computed, defineComponent, ref, watch} from 'vue';
import type {Episode, Translation, Video} from '/@/utils/videoProvider';
import {clearVideosCache, getEpisodes, getSeries, getTranslations, getVideos} from '/@/utils/videoProvider';
import SidePanel from '/@/components/WatchPage/SidePanel.vue';
import EpisodesList from '/@/components/WatchPage/EpisodesList.vue';
import TranslationsList from '/@/components/WatchPage/TranslationsList.vue';
import VideoPlayer from '/@/components/WatchPage/VideoPlayer/VideoPlayer.vue';
import WinIcon from '/@/components/WinIcon.vue';
import {useRouter} from 'vue-router';
import {showErrorMessage} from '/@/utils/dialogs';
import {getPreferredTranslationFromList} from '/@/utils/translationRecomendations';
import {putHistoryItem} from '/@/utils/history-views';



export default defineComponent({
  components: {WinIcon, VideoPlayer, TranslationsList, EpisodesList, SidePanel},
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


      const resolvedNextPageUrl = router.resolve({params: {episodeNum: nextEpisode.number, translationId}, hash: ''});
      nextEpisodeURL.value = resolvedNextPageUrl.href ? resolvedNextPageUrl.href : undefined;

      if (import.meta.env.MODE !== 'development') {
        // Если удалось определить перевод для следующей серии -- выполнить загрузку видео, чтобы кэшировать их
        await getVideos(translationId);
        // TODO: Начать загрузку непосредственно целевого видео-файла для следующего эпизода
      }
    };

    watch(selectedEpisode, prepareNextEpisode);


    const saveWatchProgress = (event: Event) => {
      if (!event.target || !(event.target instanceof HTMLVideoElement) || !selectedEpisode.value || event.target.paused) {
        return;
      }

      const currentTime = Math.floor(event.target.currentTime);

      location.hash = `t=${currentTime}`;

      putHistoryItem({
        // state: 'watching',
        seriesId: props.seriesId,
        episode: {
          number: selectedEpisode.value.number,
          time: currentTime,
          duration: event.target.duration,
        },
      });

    };



    // Доступные переводы
    const translations = ref<DeepReadonly<Translation[]>>([]);
    watch(selectedEpisode, async () => {
      if (!selectedEpisode.value?.id) {
        return;
      }

      translations.value = await getTranslations(selectedEpisode.value.id);
    });

    const selectedTranslation = computed(() => translations.value.find(e => e.id === props.translationId));


    // Загрузка доступных видео для выбранного перевода
    const videos = ref<DeepReadonly<Video[]>>([]);
    const loadVideoSources = () => {
      if (!selectedTranslation.value?.id) {
        return;
      }

      return getVideos(selectedTranslation.value.id)
        .then(v => videos.value = v)
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
        });
    };

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

    return {
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
