<template>
  <div
    ref="componentRoot"
    class="component-root"
  >
    <loading-spinner v-if="waiting" />

    <video
      ref="videoElement"
      crossorigin="anonymous"
      @click="playing = !playing"
    />
    <control-panel
      v-model:playing="playing"
      v-model:current-time.number="currentTime"
      v-model:volume.number="volume"
      v-model:muted="muted"
      v-model:selected-quality.number="selectedQuality"
      :duration="duration"
      :buffered="buffered"
      :is-fullscreen="isFullscreen"
      :qualities="qualities"
      @requestFullscreenToggle="toggleFullscreen"
    />
  </div>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {computed, defineComponent, ref, watch} from 'vue';
import {useFullscreen, useMediaControls} from '@vueuse/core';
import type {Video} from '/@/utils/videoProvider';
import ControlPanel from '/@/components/WatchPage/VideoPlayer/ControlPanel.vue';
import LoadingSpinner from '/@/components/WatchPage/VideoPlayer/LoadingSpinner.vue';

export default defineComponent({
  name: 'VideoPlayer',
  components: {LoadingSpinner, ControlPanel},
  provide: {},
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
  setup(props) {

    const qualities = computed(() =>
      Object.keys(props.videoSource.qualities)
        .map(s => Number.parseInt(s, 10))
        .sort((a, b) => b - a),
    );

    const selectedQuality = ref(qualities.value[0]);
    const selectedVideoStream = computed(() => props.videoSource.qualities[selectedQuality.value]);
    const selectedVideoStreamWithTimeStart = ref(selectedVideoStream.value);


    watch(selectedVideoStream, () => selectedVideoStreamWithTimeStart.value = selectedVideoStream.value + '#t=' + currentTime.value);

    const muted = ref(false);

    const videoElement = ref<HTMLVideoElement>();
    const {playing, duration, currentTime, buffered, waiting, volume} = useMediaControls(videoElement, {
      muted,
      autoplay: true,
      src: selectedVideoStreamWithTimeStart,
      autoPictureInPicture: true,
      preload: 'auto',
      // controls: true,
    });


    const componentRoot = ref<HTMLVideoElement>();
    const {isFullscreen, toggle: toggleFullscreen} = useFullscreen(componentRoot);


    return {
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
</style>
