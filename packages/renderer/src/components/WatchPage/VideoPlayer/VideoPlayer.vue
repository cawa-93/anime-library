<template>
  <div
    class="component-root"
    :class="{hideCursor: isFullscreen && idle}"
  >
    <loading-spinner v-if="waiting || !videoLoaded" />
    <video
      ref="videoElement"
      preload="auto"
      autoplay
      autopictureinpicture
      :class="{'controls-visible': controlsVisible}"
      crossorigin="anonymous"
      @click="playing = !playing"
      @dblclick="toggleFullscreen"
      @error="errorHandler"
      @progress="$emit('progress', {currentTime, duration})"
      @loadeddata="onLoad"
      @ended="$emit('go-to-next-episode')"
    >
      <source
        v-for="source of sources"
        :key="source.src"
        :src="source.src"
        :type="source.type || ''"
        @error="errorHandler"
      >
    </video>
    <lib-ass-subtitles-renderer
      v-if="tracks.length > 0 && isSubtitlesEnabled"
      :time="currentTime"
      :track="tracks[0]"
      :video-element="videoElement"
      :playing="playing"
      :waiting="waiting"
    />
    <transition name="fade">
      <section class="control-panel position-absolute d-grid bottom-0 w-100 text-white">
        <progress-bar
          v-model:time="currentTime"
          :frames="frames"
          class="progress-bar-container"
          :duration="duration"
          :buffered="buffered"
        />

        <button
          class="play-button win-icon"
          :title="`${playing ? 'Пауза' : 'Смотреть'} (k)`"
          @click="playing = !playing"
        >
          {{ playing ? '&#xE769;' : '&#xE768;' }}
        </button>

        <button
          :disabled="!hasNextEpisode"
          class="next-button win-icon"
          title="Следующий эпизод"
          @click="$emit('go-to-next-episode')"
        >
          &#xE893;
        </button>

        <volume-control
          v-model:muted="muted"
          v-model:volume="volume"
          class="volume-control"
        />

        <time-code
          class="time-code"
          :current-time="currentTime"
          :duration="duration"
        />

        <button
          v-if="tracks.length > 0"
          title="Субтитры"
          class="subtitles"
          @click="isSubtitlesEnabled = !isSubtitlesEnabled"
        >
          <span
            class="win-icon"
            :style="!isSubtitlesEnabled ? 'opacity: 0.5' : ''"
            aria-hidden="true"
          >
            &#xED1E;
          </span>
        </button>

        <select
          v-if="qualities.length > 0"
          v-model="selectedQuality"
          title="Качество"
          class="settings"
        >
          <option
            v-for="quality of qualities"
            :key="quality"
            :value="quality"
          >
            {{ quality }}p
          </option>
        </select>


        <toggle-pip-button
          class="picture-in-picture"
          :video="videoElement"
        />

        <button
          :title="`${isFullscreen ? 'Выход из полноэкранного режима' : 'Во весь экран'} (f)`"
          class="toggle-fullscreen-button win-icon"
          @click="toggleFullscreen"
        >
          {{ isFullscreen ? '&#xE73F;' : '&#xE740;' }}
        </button>
      </section>
    </transition>
    <transition name="fade">
      <slot v-if="controlsVisible" />
    </transition>
  </div>
</template>

<script lang="ts">
import type {DeepReadonly, PropType} from 'vue';
import {computed, defineAsyncComponent, defineComponent, onMounted, onUnmounted, ref, watch, watchEffect} from 'vue';
import {syncRef, useEventListener, useFullscreen, useIdle, useMediaControls, useStorage} from '@vueuse/core';
import type {Video, VideoSource, VideoTrack} from '/@/utils/videoProvider';
import LoadingSpinner from '/@/components/LoadingSpinner.vue';
import {useMediaHotKeys} from '/@/use/useMediaHotKeys';
import {HOUR} from '/@/utils/time';
import {getFramesFromVideo} from '/@/components/WatchPage/VideoPlayer/getFramesFromVideo';
import {trackTime} from '/@/utils/telemetry';
import TimeCode from '/@/components/WatchPage/VideoPlayer/time-code.vue';
import VolumeControl from '/@/components/WatchPage/VideoPlayer/VolumeControl.vue';
import ProgressBar from '/@/components/WatchPage/VideoPlayer/ProgressBar.vue';
import TogglePipButton from '/@/components/WatchPage/VideoPlayer/TogglePipButton.vue';


const LibAssSubtitlesRenderer = defineAsyncComponent(() => import('/@/components/WatchPage/VideoPlayer/LibAssSubtitlesRenderer.vue'));


export default defineComponent({
  name: 'VideoPlayer',
  components: {TogglePipButton, TimeCode, LibAssSubtitlesRenderer, LoadingSpinner, VolumeControl, ProgressBar},
  props: {
    startFrom: {
      type: Number,
      require: false,
      default: 0,
    },
    videos: {
      type: Array as PropType<DeepReadonly<Video[]>>,
      required: true,
    },
    hasNextEpisode: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  emits: [
    'source-error',
    'progress',
    'durationchange',
    'go-to-next-episode',
    'controls-visibility-change',
  ],

  setup: function (props, {emit}) {

    // Список доступных вариантов качества видео
    const qualities = computed(() =>
      props.videos
        .map(s => s.quality)
        .sort((a, b) => b - a),
    );


    // Выбор качества видео по умолчанию
    const selectedQuality = ref(qualities.value[0]);
    watch(qualities, () => selectedQuality.value = qualities.value[0]);


    // Массив видео для выбранного качества
    const selectedQualityVideo = computed(() => props.videos.find(s => s.quality === selectedQuality.value));


    // Ссылки на видео-ресурсы для выбранного качества
    const sources = ref<VideoSource[] | null>(null);
    watch(selectedQualityVideo, (selectedQualityVideo) => {
      sources.value = selectedQualityVideo ? selectedQualityVideo.sources.map(s => ({
        ...s,
        src: s.src + '#t=' + props.startFrom ?? 0,
      })) : null;
    }, {immediate: true});

    const videoLoaded = ref(false);
    const onLoad = () => videoLoaded.value = true;

    // Выполнять загрузку видео при изменении ссылок на ресурсы
    const videoElement = ref<HTMLVideoElement>();
    watch(sources, () => {
      videoLoaded.value = false;
      videoElement.value?.load();
    });

    // Передать ошибку родителю если не удалось загрузить видео
    const errorHandler = (event: Event) => {
      emit('source-error', event);
    };


    // Ссылки на субтитры для выбранного качества
    const tracks = computed<VideoTrack[]>(() => {
      const allTracks = selectedQualityVideo.value?.tracks || [];
      const map = new Map<string, VideoTrack>();
      allTracks.forEach(item => map.set(item.src, item));
      return [...map.values()];
    });

    const isSubtitlesEnabled = ref(true);

    const {
      playing,
      duration,
      currentTime,
      buffered,
      waiting,
      volume: videoVolume,
      muted: videoMuted,
    } = useMediaControls(videoElement);

    const volume = useStorage('volume', videoVolume.value);
    const muted = useStorage('muted', videoMuted.value);

    onMounted(() => {
      syncRef(volume, videoVolume, {immediate: true});
      syncRef(muted, videoMuted, {immediate: true});
    });

    //
    // переключение полноэкранного режима
    const pageRoot = document.querySelector('main');
    const {isFullscreen, toggle: toggleFullscreen} = useFullscreen(pageRoot);


    //
    // Быстрая перемотка
    const DEFAULT_SEEK_SPEED = 5;
    const seek = (speed = DEFAULT_SEEK_SPEED) => currentTime.value = Math.max(0, Math.min(currentTime.value + speed, duration.value));

    //
    // Работа с горячими клавишами
    useMediaHotKeys({
      playingToggle: () => playing.value = !playing.value,
      playingPause: () => playing.value = false,
      volumeDown: e => {
        volume.value = e.shiftKey ? 0 : Math.max(0, volume.value - 0.05);
        muted.value = false;
      },
      volumeUp: e => {
        volume.value = e.shiftKey ? 1 : Math.min(1, volume.value + 0.05);
        muted.value = false;
      },
      volumeMuteToggle: () => muted.value = !muted.value,
      fastForward: e => {
        const baseSpeed = DEFAULT_SEEK_SPEED * (e.code === 'KeyL' ? 2 : 1);
        seek(e.shiftKey ? baseSpeed * 2 : baseSpeed);
      },
      fastBackward: e => {
        const baseSpeed = -DEFAULT_SEEK_SPEED * (e.code === 'KeyJ' ? 2 : 1);
        seek(e.shiftKey ? baseSpeed * 2 : baseSpeed);
      },
      nextTrack: () => emit('go-to-next-episode'),
    });

    useEventListener('keydown', (event: KeyboardEvent) => {
      if (event.code === 'KeyF' && !event.shiftKey && !event.ctrlKey) {
        toggleFullscreen();
      }
    });


    //
    // Показывать/скрывать контрол бар в зависимости от активности пользователя
    const {idle} = useIdle(1000 * 3);
    const controlsVisible = computed(() => !playing.value || !idle.value);
    watch(controlsVisible, controlsVisible => emit('controls-visibility-change', controlsVisible));

    watch(
      () => props.hasNextEpisode,
      () => navigator.mediaSession && navigator.mediaSession.setActionHandler('nexttrack', props.hasNextEpisode ? () => emit('go-to-next-episode') : null),
    );

    onMounted(() => {
      if (navigator.mediaSession !== undefined) {
        navigator.mediaSession.setActionHandler('play', () => playing.value = true);
        navigator.mediaSession.setActionHandler('pause', () => playing.value = false);
        navigator.mediaSession.setActionHandler('seekbackward', () => seek(-DEFAULT_SEEK_SPEED));
        navigator.mediaSession.setActionHandler('seekforward', () => seek(DEFAULT_SEEK_SPEED));
      }
    });

    onUnmounted(() => {
      if (navigator.mediaSession !== undefined) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
      }
    });

    const frames = ref({
      step: 0,
      map: new Map<number, string>(),
    });


    const minimalQuality = computed(() => {
      let min = props.videos[0];
      for (const video of props.videos) {
        if (video.quality < min.quality) {
          min = video;
        }
      }

      return min;
    });

    const loadFrames = async (times: number[], signal: AbortSignal, src: string) => {
      const framesIterator = getFramesFromVideo(times, src);
      for await (const {time, data} of framesIterator) {
        if (signal.aborted) {
          break;
        }
        frames.value.map.set(time, data);
      }
    };

    let controller: AbortController;
    onUnmounted(() => controller && !controller.signal.aborted && controller.abort());


    watchEffect(() => {
      if (controller) {
        controller.abort();
      }

      if (!duration.value || !minimalQuality.value.sources[0].src) {
        return;
      }

      const frameLoadingStart = performance.now();

      frames.value.map.clear();
      frames.value.step = duration.value >= HOUR ? 60 : 30;
      const chunks = 3;

      const totalSteps = duration.value / frames.value.step;
      const stepPerChunk = totalSteps / chunks;
      const timeChunks: number[][] = [];
      for (let time = 0; time + frames.value.step / 2 < duration.value; time += frames.value.step) {
        const chunkIndex = Math.floor((time / frames.value.step) / stepPerChunk);
        if (!Array.isArray(timeChunks[chunkIndex])) {
          timeChunks[chunkIndex] = [];
        }
        timeChunks[chunkIndex].push(Math.floor(time + frames.value.step / 2));
      }

      controller = new AbortController();

      Promise.all(timeChunks.map((times) => loadFrames(times, controller.signal, minimalQuality.value.sources[0].src)))
        .then(() => {
          trackTime('Video timeline Frames', `Time to all frames loaded (chunks=${chunks} step=${frames.value.step})`, performance.now() - frameLoadingStart);
          console.log('Все фреймы загружены', performance.now() - frameLoadingStart);
        });
    });



    return {
      onLoad,
      videoLoaded,
      controlsVisible,
      sources,
      tracks,
      isSubtitlesEnabled,
      errorHandler,
      selectedQuality,
      qualities,
      videoElement,
      playing,
      duration,
      currentTime,
      buffered,
      waiting,
      volume,
      muted,
      isFullscreen,
      toggleFullscreen,
      idle,
      frames,
    };
  },
});
</script>

<style scoped>
@import "video-control-button.css";

.component-root {
  height: 100%;
  display: flex;
  flex-direction: column;
}

video {
  flex-grow: 1;
  min-width: 0;
  min-height: 0;
}

.hideCursor {
  cursor: none;
}


/**
 Панель управления
 */

.control-panel {
  --control-panel-bottom-padding: 8px;
  --control-panel-left-padding: 10px;
  --control-panel-right-padding: 10px;
  grid-template-columns: repeat(4, min-content) 1fr repeat(4, min-content);
  grid-template-rows: 15px min-content;
  gap: 5px 10px;
  grid-template-areas:
    "progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar"
    "play-button next-button volume-area time space subtitles settings picture-in-picture fullscreen";
  padding: 0 var(--control-panel-right-padding) var(--control-panel-bottom-padding) var(--control-panel-left-padding);
  z-index: 1;
}

.control-panel, .control-panel > * {
  text-shadow: 1px 1px 1px black;
}


.control-panel > * {
  z-index: 1;
}


.control-panel:before {
  background: linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.93) 10%, rgba(0, 0, 0, 0.81) 20%, rgba(0, 0, 0, 0.69) 30%, rgba(0, 0, 0, 0.57) 40%, rgba(0, 0, 0, 0.45) 50%, rgba(0, 0, 0, 0.35) 60%, rgba(0, 0, 0, 0.21) 70%, rgba(0, 0, 0, 0.09) 80%, rgba(0, 0, 0, 0.01) 90%, rgba(0, 0, 0, 0) 100%);
  bottom: 0;
  content: "";
  height: 200%;
  left: 0;
  position: absolute;
  width: 100%;
  z-index: 0;
}


.progress-bar-container {
  grid-area: progress-bar;
}


.play-button {
  grid-area: play-button;
}

.next-button {
  grid-area: next-button;
}

.volume-control {
  grid-area: volume-area;
}


.toggle-fullscreen-button {
  grid-area: fullscreen;
}

.time-code {
  grid-area: time;
}

.settings {
  grid-area: settings;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
}

.settings:hover {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

select.settings option {
  background: rgba(0, 0, 0, 0.8);
}

.picture-in-picture {
  grid-area: picture-in-picture;
}

.subtitles {
  grid-area: subtitles;
}

</style>
