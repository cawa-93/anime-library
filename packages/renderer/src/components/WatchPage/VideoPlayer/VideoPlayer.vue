<template>
  <div
    ref="videoPlayerRoot"
    class="component-root"
    :class="{hideCursor: isFullscreen && idle}"
  >
    <transition name="fade">
      <slot
        v-if="controlsVisible"
        name="header"
      />
    </transition>
    <loading-spinner v-if="waiting || !isVideoLoaded" />
    <video
      ref="videoElement"
      preload="auto"
      autoplay
      :class="{'controls-visible': controlsVisible}"
      crossorigin="anonymous"
      @click="playing = !playing"
      @dblclick="toggleFullscreen"
      @progress="$emit('progress', {currentTime, duration})"
      @ended="$emit('go-to-next-episode')"
    >
      <source
        :src="videoSource"
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
      <section
        v-if="controlsVisible"
        class="control-panel position-absolute d-grid bottom-0 w-100 text-white"
      >
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
          :aria-label="`${playing ? 'Пауза' : 'Смотреть'} (k)`"
          @click="playing = !playing"
        >
          {{ playing ? '&#xE769;' : '&#xE768;' }}
        </button>

        <button
          :disabled="!hasNextEpisode"
          class="next-button win-icon"
          title="Следующий эпизод"
          aria-label="Следующий эпизод"
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
          aria-label="Субтитры"
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
          title="Качество видео"
          aria-label="Качество видео"
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
          :aria-label="`${isFullscreen ? 'Выход из полноэкранного режима' : 'Во весь экран'} (f)`"
          class="toggle-fullscreen-button win-icon"
          @click="toggleFullscreen"
        >
          {{ isFullscreen ? '&#xE73F;' : '&#xE740;' }}
        </button>
      </section>
    </transition>
    <slot v-if="controlsVisible" />
  </div>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {computed, defineAsyncComponent, defineComponent, onMounted, onUnmounted, ref, watch, watchEffect} from 'vue';
import {syncRef, useEventListener, useFullscreen, useIdle, useMediaControls, useStorage} from '@vueuse/core';
import type {Video, VideoTrack} from '/@/utils/videoProvider';
import LoadingSpinner from '/@/components/LoadingSpinner.vue';
import {useMediaHotKeys} from '/@/use/useMediaHotKeys';
import TimeCode from '/@/components/WatchPage/VideoPlayer/time-code.vue';
import VolumeControl from '/@/components/WatchPage/VideoPlayer/VolumeControl.vue';
import ProgressBar from '/@/components/WatchPage/VideoPlayer/ProgressBar.vue';
import TogglePipButton from '/@/components/WatchPage/VideoPlayer/TogglePipButton.vue';
import {isMediaMetadataLoaded} from '/@/use/isMediaMetadataLoaded';
import {getFramesFromVideo} from '/@/components/WatchPage/VideoPlayer/getFramesFromVideo';
import {HOUR, SECOND_MS} from '/@/utils/time';
import {trackTime} from '/@/utils/telemetry';
import {isEnabled as isTimelineThumbnailsEnabled} from '/@/components/Options/TimelineThumbnails.vue';
import type {ActionsHandlers as UseMediaSessionHandlers} from '/@/components/WatchPage/VideoPlayer/useMediaSession';
import {useMediaSessionActionsHandlers} from '/@/components/WatchPage/VideoPlayer/useMediaSession';


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
    video: {
      type: Object as PropType<Video>,
      required: false,
      default: undefined,
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
    'go-to-next-episode',
  ],

  setup: function (props, {emit}) {

    /**
     * Массив доступных вариантов качества видео
     */
    const qualities = computed(() => props.video ? [...props.video.qualities.keys()] : []);

    const maxQuality = computed(() => Math.max(...qualities.value));
    /**
     * Выбранное качество видео
     */
    const selectedQuality = ref(maxQuality.value);

    /**
     * Автоматически переключатся на маскимальное качество при смене видео
     */
    watch(qualities, () => selectedQuality.value = maxQuality.value);


    /**
     * Источник для видео выбранного качества
     */
    const videoSource = computed(() =>
      props.video
        ? ((
          props.video.qualities.get(selectedQuality.value)
          || props.video.qualities.get(maxQuality.value)
        )
        +
        '#t=' + Math.floor(props.startFrom))
        : '',
    );



    const videoElement = ref<HTMLVideoElement>();
    const {isLoaded: isVideoLoaded} = isMediaMetadataLoaded(videoElement);

    /**
     * Выполнять загрузку видео при изменении ссылок на ресурсы
     */
    watch(videoSource, (newSrc, oldSrc) => {
      const newSrcWithoutFragment = newSrc.split('#')[0];
      const oldSrcWithoutFragment = oldSrc.split('#')[0];

      if (newSrcWithoutFragment.toLowerCase() !== oldSrcWithoutFragment.toLowerCase()) {
        videoElement.value?.load();
      }
    });

    // Передать ошибку родителю если не удалось загрузить видео
    const errorHandler = (event: Event) => {
      emit('source-error', selectedQuality.value, event);
    };


    /**
     * Массив треков для субтитров
     */
    const tracks = computed<VideoTrack[]>(() => {
      if (!props.video?.tracks || props.video.tracks.length === 0) {
        return [];
      }
      return [...new Map(props.video.tracks.map(t => [t.src, t])).values()];
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
    const videoPlayerRoot = ref();
    const {isFullscreen, toggle: toggleFullscreen} = useFullscreen(videoPlayerRoot);


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
    const {idle} = useIdle(3 * SECOND_MS);
    const controlsVisible = computed(() => !playing.value || !idle.value);


    /**
     * Media Session Actions
     */
    useMediaSessionActionsHandlers(
      computed<UseMediaSessionHandlers>(() => ({
        play: () => playing.value = true,
        seekto: (details => console.log({details})),
        pause: () => playing.value = false,
        seekbackward: () => seek(-DEFAULT_SEEK_SPEED),
        seekforward: () => seek(DEFAULT_SEEK_SPEED),
        nexttrack: props.hasNextEpisode ? () => emit('go-to-next-episode') : undefined,
      })),
    );

    let frames = ref({
      step: 0,
      map: new Map<number, string>(),
    });
    if (isTimelineThumbnailsEnabled()) {
      const minimalQualityVideo = computed(() =>
        props.video
          ? props.video.qualities.get(Math.min(...props.video.qualities.keys()))
          : undefined,
      );

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

        if (!duration.value || !minimalQualityVideo.value) {
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

        Promise.all(
          timeChunks.map(times => minimalQualityVideo.value ? loadFrames(times, controller.signal, minimalQualityVideo.value) : Promise.resolve()),
        )
          .then(() => {
            trackTime(
              'Video timeline Frames',
              `Time to all frames loaded (chunks=${chunks} step=${frames.value.step})`,
              performance.now() - frameLoadingStart,
            );
            console.log('Все фреймы загружены', performance.now() - frameLoadingStart);
          });
      });
    }

    return {
      isVideoLoaded,
      controlsVisible,
      videoSource,
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
      videoPlayerRoot,
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
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.93) 10%,
    rgba(0, 0, 0, 0.81) 20%,
    rgba(0, 0, 0, 0.69) 30%,
    rgba(0, 0, 0, 0.57) 40%,
    rgba(0, 0, 0, 0.45) 50%,
    rgba(0, 0, 0, 0.35) 60%,
    rgba(0, 0, 0, 0.21) 70%,
    rgba(0, 0, 0, 0.09) 80%,
    rgba(0, 0, 0, 0.01) 90%,
    rgba(0, 0, 0, 0) 100%
  );
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
