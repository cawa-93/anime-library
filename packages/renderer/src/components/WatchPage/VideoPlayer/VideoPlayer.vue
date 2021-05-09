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
      crossorigin="anonymous"
      @click="playing = !playing"
      @dblclick="toggleFullscreen"
      @error="errorHandler"
      @progress="updateMediaFragmentHash"
    >
      <source
        v-for="source of sources"
        :key="source.url"
        :src="source.url"
        :type="source.type || ''"
        @error="errorHandler"
      >
    </video>
    <transition name="fade">
      <control-panel
        v-if="!playing || !idle"
        v-model:playing="playing"
        v-model:current-time="currentTime"
        v-model:volume="volume"
        v-model:muted="muted"
        v-model:selected-quality="selectedQuality"
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
      <div v-if="!playing || !idle">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {computed, defineComponent, ref, watch} from 'vue';
import {and, useActiveElement, useFullscreen, useIdle, useMagicKeys, useMediaControls, whenever} from '@vueuse/core';
import type {Video} from '/@/utils/videoProvider';
import ControlPanel from '/@/components/WatchPage/VideoPlayer/ControlPanel.vue';
import LoadingSpinner from '/@/components/WatchPage/VideoPlayer/LoadingSpinner.vue';

export default defineComponent({
  name: 'VideoPlayer',
  components: {LoadingSpinner, ControlPanel},
  props: {
    videoSource: {
      type: Array as PropType<Video[]>,
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
      props.videoSource
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

    // Ссылки на видео-файлы для выбранного качества
    const sources = computed(() => {
      const mediaFragment = location.hash.startsWith('#t=') ? location.hash : '';
      return props.videoSource
        .filter(s => s.quality === selectedQuality.value)
        .map(s => {
          s.url += mediaFragment;
          return s;
        });
    });

    // Выполнять загрузку видео при изменении ссылок на ресурсы
    const videoElement = ref<HTMLVideoElement>();
    watch(sources, () => videoElement.value?.load());

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
    } = useMediaControls(videoElement, {
      muted,
      autoplay: true,
      autoPictureInPicture: true,
      preload: 'auto',
    });


    const componentRoot = ref<HTMLVideoElement>();
    const {isFullscreen, toggle: toggleFullscreen} = useFullscreen(componentRoot);

    const togglePictureInPicture = () => {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else if (videoElement.value) {
        videoElement.value.requestPictureInPicture();
      }
    };


    const {idle} = useIdle(1000 * 3);


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


    const errorHandler = (event: Event) => {
      if (videoElement.value?.networkState === videoElement.value?.NETWORK_NO_SOURCE) {
        emit('source-error', event);
      }
    };

    return {
      sources,
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
