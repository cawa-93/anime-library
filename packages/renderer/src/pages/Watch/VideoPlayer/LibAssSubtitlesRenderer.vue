<script lang="ts" setup>
import type {PropType} from 'vue';
import {onMounted, onUnmounted, ref, toRef, watch} from 'vue';
import type {VideoTrack} from '/@/utils/videoProvider';
import SubtitlesOctopus from '/@/pages/Watch/VideoPlayer/libass-wasm/subtitles-octopus.js';
import SubtitlesOctopusWorker from '/@/pages/Watch/VideoPlayer/libass-wasm/subtitles-octopus-worker?url';
import {useEventListener, useResizeObserver} from '@vueuse/core';


const props = defineProps({
  track: {
    type: Object as PropType<VideoTrack>,
    required: true,
  },

  time: {
    type: Number,
    required: true,
  },

  videoElement: {
    type: Object as PropType<HTMLVideoElement>,
    required: false,
    default: null,
  },

  playing: {
    type: Boolean,
    required: false,
    default: false,
  },

  waiting: {
    type: Boolean,
    required: false,
    default: false,
  },
});


const canvas = ref<HTMLCanvasElement>();

let SubtitlesOctopusInstance: SubtitlesOctopus | null = null;

const getVideoPosition = () => {
  const videoRatio = props.videoElement.videoWidth / props.videoElement.videoHeight;
  const width = props.videoElement.offsetWidth;
  const height = props.videoElement.offsetHeight;
  const elementRatio = width / height;
  let realWidth = width;
  let realHeight = height;
  if (elementRatio > videoRatio) realWidth = Math.floor(height * videoRatio);
  else realHeight = Math.floor(width / videoRatio);

  const x = (width - realWidth) / 2;
  const y = (height - realHeight) / 2;

  return {
    width: realWidth,
    height: realHeight,
    left: x,
    top: y,
  };
};

const position = ref({top: '0px', left: '0px'});
const resize = () => {
  if (!SubtitlesOctopusInstance) {
    return;
  }

  if (!props.videoElement) {
    return;
  }

  if (props.videoElement.videoWidth === 0 || props.videoElement.videoHeight === 0) {
    return;
  }

  const videoPosition = getVideoPosition();
  position.value.left = `${videoPosition.left}px`;
  position.value.top = `${videoPosition.top}px`;

  SubtitlesOctopusInstance.resize(videoPosition.width, videoPosition.height, videoPosition.top, videoPosition.left);
};

useEventListener(toRef(props, 'videoElement'), 'loadedmetadata', resize);
useResizeObserver(toRef(props, 'videoElement'), resize);

onMounted(() => {
  if (!SubtitlesOctopusInstance) {
    SubtitlesOctopusInstance = new SubtitlesOctopus({
      canvas: canvas.value,
      workerUrl: SubtitlesOctopusWorker,
      subUrl: props.track.src,
      lossyRender: true,
      // debug: import.meta.env.MODE === 'development',
    });
  }

  resize();

  SubtitlesOctopusInstance.setCurrentTime(props.time);
});

watch(() => props.track, () => {
  if (SubtitlesOctopusInstance) {
    SubtitlesOctopusInstance.setTrackByUrl(props.track.src);
  }
});

watch(() => props.time, () => {
  if (SubtitlesOctopusInstance) {
    SubtitlesOctopusInstance.setCurrentTime(props.time);
  }
});

watch(() => ([props.playing, props.waiting]), () => {
  if (SubtitlesOctopusInstance) {
    const isPaused = props.waiting ? true : !props.playing;
    SubtitlesOctopusInstance.setIsPaused(isPaused);
  }
});

onUnmounted(() => {
  if (SubtitlesOctopusInstance) {
    SubtitlesOctopusInstance.dispose();
    SubtitlesOctopusInstance = null;
  }
});
</script>

<template>
  <canvas
    ref="canvas"
    :style="position"
  />
</template>


<style scoped>
canvas {
  position: absolute;
  pointer-events: none;
}
</style>
