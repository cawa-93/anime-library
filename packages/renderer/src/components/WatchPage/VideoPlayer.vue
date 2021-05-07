<template>
  <div
    ref="componentRoot"
    class="component-root"
  >
    <div
      v-if="waiting"
      class="lds-ring loading"
    >
      <div />
      <div />
      <div />
      <div />
    </div>


    <video
      ref="videoElement"
      crossorigin="anonymous"
      @click="playing = !playing"
    />
    <section class="control-panel">
      <button
        class="play-button"
        @click="playing = !playing"
      >
        <win-icon>{{ playing ? '&#xE769;' : '&#xE768;' }}</win-icon>
      </button>

      <button class="next-button">
        <win-icon>&#xE76C;</win-icon>
      </button>

      <div class="volume-area">
        <button @click="volume = volume ? 0 : 1">
          <win-icon>
            {{
              volume === 0 ? '&#xE74F;'
              : volume > 0.75 ? '&#xE995;'
                : volume > 0.50 ? '&#xE994;'
                  : volume > 0.25 ? '&#xE993;'
                    : '&#xE992;'
            }}
          </win-icon>
        </button>

        <input
          v-model.number="volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
        >
      </div>

      <button
        class="toggle-fullscreen-button"
        @click="toggleFullscreen"
      >
        <win-icon>{{ isFullscreen ? '&#xE73F;' : '&#xE740;' }}</win-icon>
      </button>

      <div class="progress-bar">
        <progress
          :style="`--gradient: ${gradient}`"
          :max="duration"
          :value="currentTime"
        />

        <input
          v-model="currentTime"
          type="range"
          min="0"
          :max="duration"
        >
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {computed, defineComponent, ref} from 'vue';
import {useFullscreen, useMediaControls} from '@vueuse/core';
import type {Video} from '/@/utils/videoProvider';
import WinIcon from '/@/components/WinIcon.vue';

export default defineComponent({
  name: 'VideoPlayer',
  components: {WinIcon},
  props: {
    videoSource: {
      type: Object as PropType<Video>,
      required: true,
    },
  },
  setup(props) {
    const videoElement = ref<HTMLVideoElement>();
    const componentRoot = ref<HTMLVideoElement>();
    const {playing, duration, currentTime, buffered, waiting, volume} = useMediaControls(videoElement, {
      // muted: import.meta.env.MODE === 'development',
      autoplay: true,
      src: props.videoSource.url,
      preload: 'auto',
    });

    const defaultColor = 'rgba(0,0,0,0)';
    const bufferedColor = 'rgba(255,255,255,0.2)';

    const gradient = computed(() => {
      const regions = buffered.value.flatMap(([start, end]) => {
        // 200/600*100=
        const startPercent = Math.floor(start) / duration.value * 100;
        const endPercent = Math.round(end) / duration.value * 100;


        return [
          `${defaultColor} ${startPercent}%`,
          `${bufferedColor} ${startPercent}%`,
          `${bufferedColor} ${endPercent}%`,
          `${defaultColor} ${endPercent}%`,
        ];
      })
        .join(', ');

      return `linear-gradient(90deg, ${regions});`;
    });

    const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(componentRoot);

    return {
      videoElement,
      playing,
      duration,
      currentTime,
      buffered,
      gradient,
      waiting,
      volume,
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

.lds-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: inline-block;
  width: 80px;
  height: 80px;
}

.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fff transparent transparent transparent;
}

.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}

.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}

.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

video {
  flex-grow: 1;
  min-width: 0;
  min-height: 0;
}

.control-panel {
  position: absolute;
  display: grid;
  bottom: 0;
  width: 100%;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.8547619731486344) 0%, rgba(0, 0, 0, 0) 100%);
  grid-template-columns: repeat(3, min-content) 1fr repeat(2, min-content);
  grid-template-rows: repeat(2, min-content);
  gap: 0 0;
  grid-template-areas:
    "progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar"
    "play-button next-button volume-area space settings fullscreen";
}

.control-panel button {
  border: none;
  color: white;
  padding: 0;
  margin: 5px;
  background: transparent;
  border-radius: 3px;
  font-size: 15px;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  cursor: pointer;
}

.control-panel button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.progress-bar {
  grid-area: progress-bar;
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.progress-bar progress {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 5px;
}

.progress-bar progress[value]::-webkit-progress-bar {
  width: 100%;
  background: var(--gradient);
  border-radius: 2px;
}

.progress-bar progress[value]::-webkit-progress-value {
  background-color: cornflowerblue;
}

.progress-bar input[type="range"] {
  width: 100%;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
  height: 100%;
}


.progress-bar input[type=range]::-webkit-slider-thumb {
  visibility: hidden;
}

.progress-bar input[type=range]::-webkit-slider-runnable-track {
  visibility: hidden;
}

.play-button {
  grid-area: play-button;
}

.next-button {
  grid-area: next-button;
}

.volume-area {
  grid-area: volume-area;
  display: flex;
}

.volume-area input[type="range"] {
  appearance: none;
  background-color: transparent;
  transition: width 200ms;
  width: 0;
  cursor: e-resize;
}

.volume-area:hover input[type="range"] {
  width: 150px;
}

.volume-area input[type='range']::-webkit-slider-runnable-track {
  -webkit-appearance: none;
  overflow: hidden;
  height: 2px;
  background: #ffffff3d;
}

.volume-area input[type='range']::-webkit-slider-thumb {
  width: 10px;
  -webkit-appearance: none;
  height: 10px;
  cursor: ew-resize;
  background: white;
  border-radius: 10px;
  box-shadow: -80px 0 0 80px rgba(255, 255, 255, 0.8);
}

.toggle-fullscreen-button {
  grid-area: fullscreen;
}

/*.settings {*/
/*  grid-area: settings;*/
/*}*/
</style>
