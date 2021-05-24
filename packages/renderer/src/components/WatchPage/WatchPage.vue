<template>
  <section
    id="video-container"
  >
    <video-player
      :videos="videos"
      :next-url="nextEpisodeURL"
      @source-error="onSourceError"
      @durationchange="saveWatchProgress"
      @progress="saveWatchProgress"
    >
      <button
        v-if="showEpisodesPanel || showTranslationsPanel"
        class="playlist-button"
        @click="isSidePanelOpened = !isSidePanelOpened"
      >
        <win-icon>&#xE8FD;</win-icon>
      </button>

      <side-panel
        v-if="isSidePanelOpened && (showEpisodesPanel || showTranslationsPanel)"
        v-model:is-opened="isSidePanelOpened"
      >
        <div class="tabs">
          <div
            v-if="showEpisodesPanel"
            class="radio-button-container"
          >
            <input
              id="active-tab-episodes"
              v-model="sidePanelActiveTab"
              type="radio"
              name="active-tab"
              value="episodes"
            >
            <label for="active-tab-episodes">Эпизоды</label>
          </div>
          <div class="radio-button-container">
            <input
              id="active-tab-translations"
              v-model="sidePanelActiveTab"
              type="radio"
              name="active-tab"
              value="translations"
            >
            <label for="active-tab-translations">Переводы</label>
          </div>
        </div>

        <episodes-list
          v-if="showEpisodesPanel && sidePanelActiveTab === 'episodes'"
          :episodes="episodes"
        />
        <translations-list
          v-if="showTranslationsPanel && sidePanelActiveTab === 'translations'"
          :selected-episode-num="selectedEpisode.number"
          :translations="translations"
        />
      </side-panel>
    </video-player>
  </section>
</template>

<script lang="ts">
import {asyncComputed} from '@vueuse/core';
import type {DeepReadonly} from 'vue';
import {computed, defineComponent, ref, watch} from 'vue';
import type {Episode, Translation, Video} from '/@/utils/videoProvider';
import {clearVideosCache, getEpisodes, getTranslations, getVideos} from '/@/utils/videoProvider';
import SidePanel from '/@/components/WatchPage/SidePanel.vue';
import EpisodesList from '/@/components/WatchPage/EpisodesList.vue';
import TranslationsList from '/@/components/WatchPage/TranslationsList.vue';
import VideoPlayer from '/@/components/WatchPage/VideoPlayer/VideoPlayer.vue';
import WinIcon from '/@/components/WinIcon.vue';
import {useRouter} from 'vue-router';
import {showErrorMessage} from '/@/utils/dialogs';
import {getPreferredTranslationFromList} from '/@/utils/translationRecomendations';
import {save} from '/@/utils/history-views';



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

      save({
        state: 'watching',
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

          console.error(err);

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
    const showEpisodesPanel = computed(() => episodes.value.length > 0);
    const showTranslationsPanel = computed(() => selectedEpisode.value !== undefined && translations.value.length > 0);

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

.playlist-button {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 18px;
  background: transparent;
  border: none;
  color: white;
  display: flex;
  width: 30px;
  height: 30px;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
}

.playlist-button:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
}

.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 2.5rem;
  margin-bottom: 1rem;
}

.tabs label {
  border: none;
  background: none;
  width: 100%;
  height: 100%;
  display: grid;
  align-items: center;
  justify-content: center;
}

.tabs .radio-button-container:hover label {
  background: rgba(255, 255, 255, 0.2);
}

.tabs input:checked + label {
  font-weight: bold;
  border-bottom: 3px solid;
}

.tabs .radio-button-container {
  cursor: pointer;
  position: relative;
}
.tabs .radio-button-container input {
  position: absolute;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  cursor: pointer;
  border-radius: 0;
  opacity: 0;
}
</style>
