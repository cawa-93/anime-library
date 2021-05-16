<template>
  <div
    ref="componentRoot"
    class="component-root"
    :class="{hideCursor: isFullscreen && idle}"
  >
    <loading-spinner
      v-if="waiting"
      class="loading"
    />
    <video
      ref="videoElement"
      :class="{'controls-visible': controlsVisible}"
      crossorigin="anonymous"
      @click="playing = !playing"
      @dblclick="toggleFullscreen"
      @error="errorHandler"
      @progress="updateMediaFragmentHash"
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
      v-if="tracks.length > 0"
      :time="currentTime"
      :track="tracks[0]"
      :video-element="videoElement"
    />
    <transition name="fade">
      <control-panel
        v-if="controlsVisible"
        v-model:playing="playing"
        v-model:current-time="currentTime"
        v-model:volume="volume"
        v-model:muted="muted"
        v-model:selected-quality="selectedQuality"
        :is-subtitles-enabled="false"
        :has-subtitles="tracks.length > 0"
        :duration="duration"
        :buffered="buffered"
        :is-fullscreen="isFullscreen"
        :qualities="qualities"
        :next-url="nextUrl"
        :is-picture-in-picture="isPictureInPicture"
        @requestFullscreenToggle="toggleFullscreen"
        @requestPictureInPicture="togglePictureInPicture"
      />
    </transition>
    <transition name="fade">
      <div v-if="controlsVisible">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import type {DeepReadonly, PropType} from 'vue';
import {computed, defineAsyncComponent, defineComponent, readonly, ref, watch} from 'vue';
import {and, useActiveElement, useFullscreen, useIdle, useMagicKeys, useMediaControls, whenever} from '@vueuse/core';
import type {Video, VideoSource, VideoTrack} from '/@/utils/videoProvider';
import ControlPanel from '/@/components/WatchPage/VideoPlayer/ControlPanel.vue';
import LoadingSpinner from '/@/components/WatchPage/VideoPlayer/LoadingSpinner.vue';

const LibAssSubtitlesRenderer = defineAsyncComponent(() => import('/@/components/WatchPage/VideoPlayer/LibAssSubtitlesRenderer.vue'));


export default defineComponent({
  name: 'VideoPlayer',
  components: {LibAssSubtitlesRenderer, LoadingSpinner, ControlPanel},
  props: {
    videos: {
      type: Array as PropType<DeepReadonly<Video[]>>,
      required: true,
    },
    nextUrl: {
      type: String,
      required: false,
      default: null,
    },
  },

  emits: ['source-error'],

  setup(props, {emit}) {

    // Список доступных вариантов качества видео
    const qualities = computed(() =>
      props.videos
        .map(s => s.quality)
        .sort((a, b) => b - a),
    );


    // Выбор качества видео по умолчанию
    const selectedQuality = ref(qualities.value[0]);
    watch(qualities, () => {
      if (!qualities.value.includes(selectedQuality.value)) {
        selectedQuality.value = qualities.value[0];
      }
    });


    // Массив видео для выбранного качества
    const selectedQualityVideos = computed(() => props.videos.filter(s => s.quality === selectedQuality.value));


    // Ссылки на видео-ресурсы для выбранного качества
    const sources = computed<VideoSource[]>(() => {
      const mediaFragment = location.hash.startsWith('#t=') ? location.hash : '';

      return selectedQualityVideos.value
        .flatMap((v) => {
          if (mediaFragment !== '') {
            return v.sources.map(source => readonly({...source, src: source.src + mediaFragment}));
          }
          return v.sources;
        });
    });


    // Выполнять загрузку видео при изменении ссылок на ресурсы
    const videoElement = ref<HTMLVideoElement>();
    watch(sources, () => {
      videoElement.value?.load();
      playing.value ? videoElement.value?.play() : videoElement.value?.pause();
    });

    // Передать ошибку родителю если не удалось загрузить видео
    const errorHandler = (event: Event) => {
      if (videoElement.value?.networkState === videoElement.value?.NETWORK_NO_SOURCE) {
        emit('source-error', event);
      }
    };


    // Ссылки на субтитры для выбранного качества
    const tracks = computed<VideoTrack[]>(() => {
      const allTracks = selectedQualityVideos.value.flatMap(v => v.tracks || []);
      const map = new Map<string, VideoTrack>();
      allTracks.forEach(item => map.set(item.src, item));
      return [...map.values()];
    });

    // const selectedTrack = computed(() => tracks.value[0]);
    // let SubtitlesOctopusInstance: SubtitlesOctopus | null = null;
    // watchEffect(() => {
    //   if (!videoElement.value) {
    //     return;
    //   }
    //
    //   if (!selectedTrack?.value?.src) {
    //     if (SubtitlesOctopusInstance) {
    //       SubtitlesOctopusInstance.freeTrack();
    //     }
    //     return;
    //   }
    //
    //   if (!SubtitlesOctopusInstance) {
    //     SubtitlesOctopusInstance = new SubtitlesOctopus({
    //       video: videoElement.value, // HTML5 video element
    //       workerUrl: SubtitlesOctopusWorker,
    //       legacyWorkerUrl: SubtitlesOctopusWorkerLegacy,
    //       subUrl: selectedTrack.value.src,
    //       debug: import.meta.env.MODE === 'development',
    //     });
    //   } else {
    //     SubtitlesOctopusInstance.setTrackByUrl(selectedTrack?.value?.src);
    //   }
    // });
    //
    // onUnmounted(() => {
    //   if (SubtitlesOctopusInstance) {
    //     SubtitlesOctopusInstance.dispose();
    //   }
    // });

    /**
     * Сохраняет `currentTime` в хэш страницы в виде медиа фрагмента `#t=${currentTime}`
     * Нужно для того, чтобы при переключении качества или перевода начать воспроизведение с того же места
     */
    const updateMediaFragmentHash = () => {
      if (playing.value && currentTime.value > 60) {
        location.hash = 't=' + currentTime.value.toFixed(0);
      }
    };


    const muted = ref(false);


    const {
      playing,
      duration,
      currentTime,
      buffered,
      waiting,
      volume,
      isPictureInPicture,
      // tracks: wrappedTracks,
    } = useMediaControls(videoElement, {
      muted,
      autoplay: true,
      autoPictureInPicture: true,
      preload: 'auto',
    });

    // const isSubtitlesEnabled = computed<boolean>({
    //   get() {
    //     return selectedTrack.value !== -1;
    //   },
    //   set(v) {
    //     v ? enableTrack(wrappedTracks.value[0]) : disableTrack();
    //   },
    // });


    //
    // переключение полноэкранного режима
    const componentRoot = ref<HTMLVideoElement>();
    const {isFullscreen, toggle: toggleFullscreen} = useFullscreen(componentRoot);
    const togglePictureInPicture = () => {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else if (videoElement.value) {
        videoElement.value.requestPictureInPicture();
      }
    };


    //
    // Работа с горячими клавишами
    const activeElement = useActiveElement();
    const notUsingInteractiveElement = computed(() =>
      activeElement.value?.tagName !== 'INPUT'
      && activeElement.value?.tagName !== 'TEXTAREA'
      && activeElement.value?.tagName !== 'SELECT'
      && activeElement.value?.tagName !== 'BUTTON',
    );

    const {space, arrowRight, arrowLeft, arrowUp, arrowDown, pause, play} = useMagicKeys();
    whenever(and(space, notUsingInteractiveElement), () => playing.value = !playing.value);
    whenever(and(arrowRight, notUsingInteractiveElement), () => currentTime.value += 30);
    whenever(and(arrowLeft, notUsingInteractiveElement), () => currentTime.value -= 30);
    whenever(pause, () => playing.value = false);
    whenever(play, () => playing.value = true);
    whenever(and(arrowUp, notUsingInteractiveElement), () => volume.value = Math.min(1, volume.value + 0.1));
    whenever(and(arrowDown, notUsingInteractiveElement), () => volume.value = Math.max(0, volume.value - 0.1));


    //
    // Показывать/скрывать контрол бар в зависимости от активности пользователя
    const {idle} = useIdle(1000 * 3);
    const controlsVisible = computed(() => !playing.value || !idle.value);


    return {
      controlsVisible,
      sources,
      tracks,
      // wrappedTracks,
      // isSubtitlesEnabled,
      errorHandler,
      updateMediaFragmentHash,
      togglePictureInPicture,
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
      componentRoot,
      isFullscreen,
      toggleFullscreen,
      isPictureInPicture,
      idle,
    };
  },
});
</script>

<style scoped>
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

/*noinspection CssInvalidPseudoSelector*/
video::-webkit-media-text-track-display {
  transition: transform 0.5s;
  will-change: transform;
}

/*noinspection CssInvalidPseudoSelector*/
video.controls-visible::-webkit-media-text-track-display {
  transform: translateY(-50px);
}

.loading {
  position: absolute;
  top:50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.hideCursor {
  cursor: none;
}
</style>
