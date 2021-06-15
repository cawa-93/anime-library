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
      <control-panel
        v-if="controlsVisible"
        v-model:playing="playing"
        v-model:current-time="currentTime"
        v-model:volume="volume"
        v-model:muted="muted"
        v-model:selected-quality="selectedQuality"
        v-model:is-subtitles-enabled="isSubtitlesEnabled"
        :has-subtitles="tracks.length > 0"
        :duration="duration"
        :buffered="buffered"
        :is-fullscreen="isFullscreen"
        :qualities="qualities"
        :has-next-episode="hasNextEpisode"
        :is-picture-in-picture="isPictureInPicture"
        @requestFullscreenToggle="toggleFullscreen"
        @requestPictureInPicture="togglePictureInPicture"
        @goToNextEpisode="$emit('go-to-next-episode')"
      />
    </transition>
    <transition name="fade">
      <slot v-if="controlsVisible" />
    </transition>
  </div>
</template>

<script lang="ts">
import type {DeepReadonly, PropType} from 'vue';
import {computed, defineAsyncComponent, defineComponent, onMounted, onUnmounted, ref, watch} from 'vue';
import {syncRef, useEventListener, useFullscreen, useIdle, useMediaControls, useStorage} from '@vueuse/core';
import type {Video, VideoSource, VideoTrack} from '/@/utils/videoProvider';
import ControlPanel from '/@/components/WatchPage/VideoPlayer/ControlPanel.vue';
import LoadingSpinner from '/@/components/LoadingSpinner.vue';
import {useMediaHotKeys} from '/@/use/useMediaHotKeys';


const LibAssSubtitlesRenderer = defineAsyncComponent(() => import('/@/components/WatchPage/VideoPlayer/LibAssSubtitlesRenderer.vue'));


export default defineComponent({
  name: 'VideoPlayer',
  components: {LibAssSubtitlesRenderer, LoadingSpinner, ControlPanel},
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
      sources.value = selectedQualityVideo ? selectedQualityVideo.sources.map(s => ({...s, src: s.src + '#t=' + props.startFrom ?? 0})) : null;
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
      isPictureInPicture,
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
    // Режим Картинка в Картинке
    const togglePictureInPicture = () => {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else if (videoElement.value) {
        videoElement.value.requestPictureInPicture();
      }
    };

    //
    // Быстрая перемотка
    const DEFAULT_SEEK_SPEED = 5;
    const seek = (speed = DEFAULT_SEEK_SPEED) => currentTime.value = Math.max(0, Math.min(currentTime.value + speed, duration.value));

    //
    // Работа с горячими клавишами
    useMediaHotKeys({
      playingToggle: () => playing.value = !playing.value,
      playingPause: () => playing.value = false,
      volumeDown: e => volume.value = e.shiftKey ? 0 : Math.max(0, volume.value - 0.05),
      volumeUp: e => volume.value = e.shiftKey ? 1 : Math.min(1, volume.value + 0.05),
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
      if (event.code === 'KeyF') {
        toggleFullscreen();
      }
      else if (event.code === 'KeyI') {
        togglePictureInPicture();
      }
    });


    //
    // Показывать/скрывать контрол бар в зависимости от активности пользователя
    const {idle} = useIdle(1000 * 3);
    const controlsVisible = computed(() => !playing.value || !idle.value);

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




    return {
      onLoad,
      videoLoaded,
      controlsVisible,
      sources,
      tracks,
      isSubtitlesEnabled,
      errorHandler,
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



.hideCursor {
  cursor: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>
