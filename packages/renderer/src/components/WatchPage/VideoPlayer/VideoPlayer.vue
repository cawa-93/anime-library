<template>
  <div
    ref="componentRoot"
    class="component-root"
    :class="{hideCursor: isFullscreen && idle}"
  >
    <loading-spinner
      v-if="waiting || !videoLoaded"
      class="loading"
    />
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
      @progress="$emit('progress', $event)"
      @durationchange="$emit('durationchange', $event)"
      @loadeddata="onLoad"
      @ended="onEpisodeEnded"
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
import {computed, defineAsyncComponent, defineComponent, onMounted, onUnmounted, readonly, ref, watch} from 'vue';
import {and, useActiveElement, useFullscreen, useIdle, useMagicKeys, useMediaControls, whenever} from '@vueuse/core';
import type {Video, VideoSource, VideoTrack} from '/@/utils/videoProvider';
import ControlPanel from '/@/components/WatchPage/VideoPlayer/ControlPanel.vue';
import LoadingSpinner from '/@/components/WatchPage/VideoPlayer/LoadingSpinner.vue';
import router from '/@/router';


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

  emits: [
    'source-error',
    'progress',
    'durationchange',
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
        .flatMap((v) =>
          mediaFragment !== ''
            ? v.sources.map(source => readonly({...source, src: source.src + mediaFragment}))
            : v.sources);
    });


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

    const isSubtitlesEnabled = ref(true);

    const {
      playing,
      duration,
      currentTime,
      buffered,
      waiting,
      volume,
      isPictureInPicture,
      muted,
    } = useMediaControls(videoElement);


    //
    // переключение полноэкранного режима
    const componentRoot = ref<HTMLVideoElement>();
    const {isFullscreen, toggle: toggleFullscreen} = useFullscreen(componentRoot);


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
    const seekBackward = (skipTime = 5) => Math.max(currentTime.value - skipTime, 0);
    const seekForward = (skipTime = 5) => Math.min(currentTime.value + skipTime, duration.value);

    //
    // Работа с горячими клавишами
    const activeElement = useActiveElement();
    const notUsingInteractiveElement = computed(() => {
        console.log(activeElement.value?.tagName);
        return activeElement.value?.tagName !== 'INPUT'
          && activeElement.value?.tagName !== 'TEXTAREA'
          && activeElement.value?.tagName !== 'SELECT'
          && activeElement.value?.tagName !== 'BUTTON';
      },
    );

    const {space, arrowRight, arrowLeft, arrowUp, arrowDown, pause, play} = useMagicKeys();
    whenever(and(space, notUsingInteractiveElement), () => playing.value = !playing.value);
    whenever(and(arrowRight, notUsingInteractiveElement), seekForward);
    whenever(and(arrowLeft, notUsingInteractiveElement), seekBackward);
    whenever(pause, () => playing.value = false);
    whenever(play, () => playing.value = true);
    whenever(and(arrowUp, notUsingInteractiveElement), () => volume.value = Math.min(1, volume.value + 0.1));
    whenever(and(arrowDown, notUsingInteractiveElement), () => volume.value = Math.max(0, volume.value - 0.1));


    //
    // Показывать/скрывать контрол бар в зависимости от активности пользователя
    const {idle} = useIdle(1000 * 3);
    const controlsVisible = computed(() => !playing.value || !idle.value);

    watch(
      () => props.nextUrl,
      () => navigator.mediaSession && navigator.mediaSession.setActionHandler('nexttrack', props.nextUrl ? () => router.replace(props.nextUrl) : null),
    );

    onMounted(() => {
      if (navigator.mediaSession !== undefined) {
        navigator.mediaSession.setActionHandler('play', () => playing.value = true);
        navigator.mediaSession.setActionHandler('pause', () => playing.value = false);
        navigator.mediaSession.setActionHandler('seekbackward', () => seekBackward);
        navigator.mediaSession.setActionHandler('seekforward', () => seekForward);
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


    const onEpisodeEnded = () => {
      if (props.nextUrl) {
        router.replace(props.nextUrl);
      }
    };

    return {
      onEpisodeEnded,
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
