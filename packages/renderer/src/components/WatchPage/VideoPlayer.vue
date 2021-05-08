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


      <button
        class="play-button"
        @click="playing = !playing"
      >
        <win-icon>{{ playing ? '&#xE769;' : '&#xE768;' }}</win-icon>
      </button>

      <button
        class="next-button"
        :disabled="!nextUrl"
      >
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
      <span class="time">
        {{ formattedCurrentTime }} / {{ formattedDuration }}
      </span>
      <select
        v-model="selectedQuality"
        class="settings"
      >
        <option
          v-for="(_, quality) of videoSource.qualities"
          :key="quality"
          :value="quality"
        >
          {{ quality }}p
        </option>
      </select>

      <button
        class="toggle-fullscreen-button"
        @click="toggleFullscreen"
      >
        <win-icon>{{ isFullscreen ? '&#xE73F;' : '&#xE740;' }}</win-icon>
      </button>
    </section>
  </div>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {computed, defineComponent, ref, watch} from 'vue';
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
    nextUrl: {
      type: String,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const videoElement = ref<HTMLVideoElement>();
    const componentRoot = ref<HTMLVideoElement>();

    const q = Object.keys(props.videoSource.qualities).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
    const selectedQuality = ref(q[0]);
    const selectedVideoStream = computed(() => props.videoSource.qualities[selectedQuality.value]);
    const selectedVideoStreamWithTimeStart = ref(selectedVideoStream.value);

    watch(selectedVideoStream, () => selectedVideoStreamWithTimeStart.value = selectedVideoStream.value + '#t=' + currentTime.value);

    const {playing, duration, currentTime, buffered, waiting, volume} = useMediaControls(videoElement, {
      autoplay: true,
      src: selectedVideoStreamWithTimeStart,
      autoPictureInPicture: true,
      preload: 'auto',
    });

    const defaultColor = 'rgba(255,255,255,0)';
    const bufferedColor = 'rgba(255,255,255,0.2)';

    const gradient = computed(() => {
      const regions = buffered.value.flatMap(([start, end]) => {
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

    const {isFullscreen, toggle: toggleFullscreen} = useFullscreen(componentRoot);

    const getFormattedTime = (sec: number) => {
      const d = new Date(sec * 1000);

      const options: Intl.DateTimeFormatOptions = {minute: 'numeric', second: 'numeric'};
      if (sec > 1000 * 60 * 60) {
        options.hour = 'numeric';
      }

      return new Intl.DateTimeFormat('ru', options).format(d);
    };

    const formattedDuration = computed(() => getFormattedTime(duration.value));
    const formattedCurrentTime = computed(() => getFormattedTime(currentTime.value));

    return {
      selectedQuality,
      videoElement,
      playing,
      duration,
      formattedDuration,
      currentTime,
      formattedCurrentTime,
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
  grid-template-columns: repeat(4, min-content) 1fr repeat(2, min-content);
  grid-template-rows: repeat(2, min-content);
  gap: 5px 10px;
  grid-template-areas:
    "progress-bar progress-bar  progress-bar progress-bar progress-bar progress-bar progress-bar"
    "play-button next-button volume-area time space settings fullscreen";
  padding: 5px;
  color: white;
}

.control-panel button {
  border: none;
  padding: 0;
  color: inherit;
  background: transparent;
  border-radius: 3px;
  font-size: 15px;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
}

.control-panel button:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
}

.control-panel button:disabled {
  opacity: 0.3;
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
  background-color: rgba(255, 255, 255, 0.2);
}

.progress-bar progress[value]::-webkit-progress-bar {
  width: 100%;
  /*noinspection CssUnresolvedCustomProperty*/
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

.volume-area:hover input[type="range"], .volume-area:focus-within input[type="range"] {
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

.time {
  grid-area: time;
  display: flex;
  align-items: center;
  white-space: nowrap;
  pointer-events: none;
}

.settings {
  grid-area: settings;
  border: none;
  background: none;
  color: inherit;
}

select.settings option {
  background: rgba(0, 0, 0, 0.8);
}
</style>
