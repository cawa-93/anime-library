<template>
  <section
    id="video-container"
  >
    <video-player
      :videos="videos"
      :next-url="nextEpisodeURL"
      @source-error="onSourceError"
    >
      <button
        v-if="episodes"
        class="playlist-button"
        @click="isSidePanelOpened = !isSidePanelOpened"
      >
        <win-icon>&#xE8FD;</win-icon>
      </button>

      <side-panel
        v-if="isSidePanelOpened"
        v-model:is-opened="isSidePanelOpened"
      >
        <div class="tabs">
          <div class="radio-button-container">
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
          v-if="episodes.length > 0 && sidePanelActiveTab === 'episodes'"
          :episodes="episodes"
        />
        <translations-list
          v-if="translations.length > 0 && sidePanelActiveTab === 'translations'"
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
import {computed, defineComponent, ref, watchEffect} from 'vue';
import type {Episode, Translation, Video} from '/@/utils/videoProvider';
import {clearVideosCache, getEpisodes, getTranslations, getVideos} from '/@/utils/videoProvider';
import SidePanel from '/@/components/WatchPage/SidePanel.vue';
import EpisodesList from '/@/components/WatchPage/EpisodesList.vue';
import TranslationsList from '/@/components/WatchPage/TranslationsList.vue';
import VideoPlayer from '/@/components/WatchPage/VideoPlayer/VideoPlayer.vue';
import WinIcon from '/@/components/WinIcon.vue';
import {useRouter} from 'vue-router';
import {showErrorMessage} from '/@/utils/dialogs';



export default defineComponent({
  components: {WinIcon, VideoPlayer, TranslationsList, EpisodesList, SidePanel},
  props: {
    seriesId: {
      type: Number,
      required: true,
    },
    episodeNum: {
      type: Number,
      required: false,
      default: null,
    },
    translationId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  setup(props) {
    // Эпизоды
    const episodes = asyncComputed(() => props.seriesId ? getEpisodes(props.seriesId) : [] as Episode[], [] as Episode[]);
    const selectedEpisode = computed(() => episodes.value.find(e => e.number == props.episodeNum) || episodes.value[0]);

    const router = useRouter();
    const nextEpisodeURL = computed(() => {
      const nextEpisode = episodes.value[episodes.value.findIndex(e => e === selectedEpisode.value) + 1];
      if (nextEpisode === undefined) {
        return undefined;
      }
      const resolved = router.resolve({params: {episodeNum: nextEpisode.number, translationId: ''}, hash: ''});

      if (!resolved) {
        console.error('Не удалось определить ссылку на следующую серию', {resolved});
        return undefined;
      }

      return resolved.href;
    });


    // Доступные переводы
    const translations = asyncComputed(() => selectedEpisode.value ? getTranslations(selectedEpisode.value.id) : [] as Translation[], [] as Translation[]);
    const selectedTranslation = computed(() => translations.value.find(e => e.id === props.translationId) || translations.value[0]);

    // Загрузка доступных видео для выбранного перевода
    const videos = ref<DeepReadonly<Video[]>>([]);
    const loadVideoSources = () => getVideos(selectedTranslation.value.id)
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

        return [];
      });

    watchEffect(() => {
      if (selectedTranslation.value && selectedTranslation.value.id) {
        return loadVideoSources();
      }
    });

    const onSourceError = () =>
      clearVideosCache(selectedTranslation.value.id)
        .then(() => loadVideoSources());


    const isSidePanelOpened = ref(false);
    const sidePanelActiveTab = ref<'episodes' | 'translations'>('translations');

    return {
      onSourceError,
      nextEpisodeURL,
      episodes,
      selectedEpisode,
      translations,
      videos,
      isSidePanelOpened,
      sidePanelActiveTab,
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
