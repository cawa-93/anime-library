<template>
  <canvas
    ref="canvas"
    :style="position"
  />
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {defineComponent, onUnmounted, ref, watch, watchEffect} from 'vue';
import type {VideoTrack} from '/@/utils/videoProvider';
import SubtitlesOctopus from '/@/components/WatchPage/VideoPlayer/libass-wasm/subtitles-octopus.js';
import SubtitlesOctopusWorker from '/@/components/WatchPage/VideoPlayer/libass-wasm/subtitles-octopus-worker.js?url';
import {useEventListener, useResizeObserver} from '@vueuse/core';

export default defineComponent({
  name: 'LibAssSubtitlesRenderer',
  props: {
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
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement>();

    let SubtitlesOctopusInstance: SubtitlesOctopus | null = null;
    let observer: ResizeObserver | null = null;


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

      const videoPosition = getVideoPosition();
      position.value.left = `${videoPosition.left}px`;
      position.value.top = `${videoPosition.top}px`;

      SubtitlesOctopusInstance.resize(videoPosition.width, videoPosition.height, videoPosition.top, videoPosition.left);

    };

    watchEffect(() => {
      if (!canvas.value || !props.videoElement) {
        return;
      }

      if (!SubtitlesOctopusInstance) {
        SubtitlesOctopusInstance = new SubtitlesOctopus({
          canvas: canvas.value,
          workerUrl: SubtitlesOctopusWorker,
          subUrl: props.track.src,
          lossyRender: true,
          debug: import.meta.env.MODE === 'development',
        });
      } else {
        SubtitlesOctopusInstance.setTrackByUrl(props.track.src);
      }

      if (props.videoElement.videoWidth === 0) {
        useEventListener(props.videoElement, 'loadedmetadata', resize, {once: true});
      } else {
        resize();
      }
    });


    useResizeObserver(props.videoElement, resize);

    watch(() => props.time, () => {
      if (SubtitlesOctopusInstance) {
        SubtitlesOctopusInstance.setCurrentTime(props.time);
      }
    });

    onUnmounted(() => {
      if (SubtitlesOctopusInstance) {
        SubtitlesOctopusInstance.dispose();
        SubtitlesOctopusInstance = null;
      }

      if (observer) {
        observer.disconnect();
        observer = null;
      }
    });


    return {canvas, position};
  },
});
</script>

<style scoped>
canvas {
  position: absolute;
  pointer-events: none;
}
</style>
