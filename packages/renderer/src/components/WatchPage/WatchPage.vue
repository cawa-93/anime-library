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
        @click="send('TOGGLE')"
      >
        <win-icon>&#xE8FD;</win-icon>
      </button>

      <side-panel
        v-if="episodes"
        :is-opened="state.matches('expanded')"
        @close-request="send('TOGGLE')"
      >
        <div class="tabs">
          <button
            :class="{active: state.matches('expanded.episodes')}"
            @click="send('OPEN_EPISODES')"
          >
            Эпизоды
          </button>
          <button
            :class="{active: state.matches('expanded.translations')}"
            @click="send('OPEN_TRANSLATIONS')"
          >
            Переводы
          </button>
        </div>
        <episodes-list
          v-if="state.matches('expanded.episodes')"
          :episodes="episodes"
        />
        <translations-list
          v-if="state.matches('expanded.translations')"
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
import {Machine} from 'xstate';
import {useMachine} from '@xstate/vue';
import VideoPlayer from '/@/components/WatchPage/VideoPlayer/VideoPlayer.vue';
import WinIcon from '/@/components/WinIcon.vue';
import {useRouter} from 'vue-router';


const PanelStateMachine = Machine({
  initial: 'collapsed',
  states: {
    collapsed: {
      on: {
        TOGGLE: 'expanded.memo',
      },
    },
    expanded: {
      on: {
        TOGGLE: 'collapsed',
      },
      initial: 'episodes',
      states: {
        episodes: {
          on: {
            OPEN_TRANSLATIONS: 'translations',
          },
        },
        translations: {
          on: {
            OPEN_EPISODES: 'episodes',
          },
        },
        memo: {
          type: 'history',
        },
      },
    },
  },
});


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
    const loadVideoSources = () => getVideos(selectedTranslation.value.id).then(v => {
      videos.value = v;
    });

    watchEffect(() => {
      if (selectedTranslation.value && selectedTranslation.value.id) {
        return loadVideoSources();
      }
    });

    const onSourceError = () =>
      clearVideosCache(selectedTranslation.value.id)
        .then(() => loadVideoSources());


    const {state, send} = useMachine(PanelStateMachine);

    return {
      onSourceError,
      nextEpisodeURL,
      episodes,
      selectedEpisode,
      translations,
      videos,
      state,
      send,
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
  display: flex;
  height: 2.5rem;
  margin-bottom: 1rem;
}
.tabs button {
  flex: 1;
  border: none;
  background: none;
  cursor: pointer;
}
.tabs button:hover {
  background: rgba(255,255,255,0.2);
}
.tabs button.active {
  font-weight: bold;
  border-bottom: 3px solid;
}
</style>
