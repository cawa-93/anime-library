<template>
  <div
    ref="componentRoot"
    class="component-root"
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
      @error="$emit('video-error')"
      @progress="updateMediaFragmentHash"
    />
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
import {computed, defineComponent, ref} from 'vue';
import {and, useActiveElement, useFullscreen, useIdle, useMagicKeys, useMediaControls, whenever} from '@vueuse/core';
import type {Video} from '/@/utils/videoProvider';
import ControlPanel from '/@/components/WatchPage/VideoPlayer/ControlPanel.vue';
import LoadingSpinner from '/@/components/WatchPage/VideoPlayer/LoadingSpinner.vue';

export default defineComponent({
  name: 'VideoPlayer',
  components: {LoadingSpinner, ControlPanel},
  props: {
    videoSource: {
      type: Object as PropType<Video>,
      required: true,
    },
    nextUrl: {
      type: String,
      required: false,
      default: null,
    },
  },

  emits: ['video-error'],

  setup(props) {

    const qualities = computed(() =>
      Object.keys(props.videoSource.qualities)
        .map(s => Number.parseInt(s, 10))
        .sort((a, b) => b - a),
    );

    const selectedQuality = ref(qualities.value[0]);

    const selectedVideoStream = computed(() => {
      const mediaFragment = location.hash.startsWith('#t=') ? location.hash : '';
      return props.videoSource.qualities[selectedQuality.value] + mediaFragment;
    });

    const updateMediaFragmentHash = () => {
      if (playing.value && currentTime.value > 60) {
        location.hash = 't=' + currentTime.value.toFixed(0);
        console.log(location.hash);
      }
    };

    const muted = ref(false);

    const videoElement = ref<HTMLVideoElement>();
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
      src: selectedVideoStream,
      autoPictureInPicture: true,
      preload: 'auto',
      // controls: true,
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



    return {
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
</style>
