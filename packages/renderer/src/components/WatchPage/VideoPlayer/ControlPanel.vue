<template>
  <section class="control-panel">
    <div class="progress-bar">
      <progress
        :style="`--gradient: ${bufferedIndicator}`"
        :max="duration"
        :value="currentTimeState"
      />

      <input
        v-model.number="currentTimeState"
        type="range"
        min="0"
        :max="duration"
      >
    </div>


    <button
      class="play-button"
      @click="playingState = !playingState"
    >
      <win-icon>{{ playingState ? '&#xE769;' : '&#xE768;' }}</win-icon>
    </button>

    <router-link
      v-if="nextUrl"
      :to="nextUrl"
      class="next-button"
      :class="{disabled: !nextUrl}"
    >
      <win-icon>&#xE893;</win-icon>
    </router-link>
    <button
      v-else
      disabled
    >
      <win-icon>&#xE893;</win-icon>
    </button>

    <div class="volume-area">
      <button @click="mutedState = !mutedState">
        <win-icon>
          {{
            volumeState === 0 ? '&#xE74F;'
            : volumeState > 0.75 ? '&#xE995;'
              : volumeState > 0.50 ? '&#xE994;'
                : volumeState > 0.25 ? '&#xE993;'
                  : '&#xE992;'
          }}
        </win-icon>
      </button>

      <input
        v-model.number="volumeState"
        type="range"
        min="0"
        max="1"
        step="0.01"
        @input="mutedState = false"
      >
    </div>
    <span class="time">
      {{ formattedCurrentTime }} / {{ formattedDuration }}
    </span>


    <select
      v-if="qualities.length > 0"
      v-model="selectedQualityState"
      class="settings"
    >
      <option
        v-for="quality of qualities"
        :key="quality"
        :value="quality"
      >
        {{ quality }}p
      </option>
    </select>


    <button
      class="picture-in-picture"
      @click="$emit('requestPictureInPicture')"
    >
      <win-icon>{{ isPictureInPicture ? '&#xE944;' : '&#xE8A7;' }}</win-icon>
    </button>

    <button
      class="toggle-fullscreen-button"
      @click="$emit('requestFullscreenToggle')"
    >
      <win-icon>{{ isFullscreen ? '&#xE73F;' : '&#xE740;' }}</win-icon>
    </button>
  </section>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {computed, defineComponent} from 'vue';
import WinIcon from '/@/components/WinIcon.vue';
import {useVModel} from '@vueuse/core';

export default defineComponent({
  name: 'ControlPanel',
  components: {WinIcon},

  props: {
    buffered: {
      type: Array as PropType<[number, number][]>,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    currentTime: {
      type: Number,
      required: true,
    },
    playing: {
      type: Boolean,
      required: true,
    },
    nextUrl: {
      type: String,
      required: false,
      default: null,
    },
    muted: {
      type: Boolean,
      required: true,
    },
    volume: {
      type: Number,
      required: true,
    },
    qualities: {
      type: Array as PropType<number[]>,
      required: false,
      default: () => ([]),
    },
    selectedQuality: {
      type: Number,
      required: false,
      default: null,
    },
    isPictureInPicture: {
      type: Boolean,
      required: false,
      default: false,
    },
    isFullscreen: {
      type: Boolean,
      require: true,
    },
  },

  emits: {
    'update:currentTime': null,
    'update:playing': null,
    'update:volume': null,
    'update:muted': null,
    'update:selectedQuality': null,
    requestFullscreenToggle: null,
    requestPictureInPicture: null,
  },

  setup(props, {emit}) {
    /**
     * Progress bar
     */
    const currentTimeState = useVModel(props, 'currentTime', emit);

    const defaultColorIndicator = 'rgba(255,255,255,0)';
    const bufferedColorIndicator = 'rgba(255,255,255,0.2)';

    const bufferedIndicator = computed(() => {
      const regions = props.buffered.flatMap(([start, end]) => {
        const startPercent = Math.floor(start) / props.duration * 100;
        const endPercent = Math.round(end) / props.duration * 100;

        return [
          `${defaultColorIndicator} ${startPercent}%`,
          `${bufferedColorIndicator} ${startPercent}%`,
          `${bufferedColorIndicator} ${endPercent}%`,
          `${defaultColorIndicator} ${endPercent}%`,
        ];
      })
        .join(', ');

      return `linear-gradient(90deg, ${regions});`;
    });


    /**
     * Play Button
     */
    const playingState = useVModel(props, 'playing', emit);


    /**
     * Volume Control
     */
    const mutedState = useVModel(props, 'muted', emit);
    const volumeState = computed<number>({
      get() {
        return props.muted ? 0 : props.volume;
      },
      set(value) {
        emit('update:muted', false);
        emit('update:volume', value);
      },
    });

    /**
     * Timer
     */
    const getFormattedTime = (sec: number) => {
      const d = new Date(sec * 1000);

      const options: Intl.DateTimeFormatOptions = {minute: 'numeric', second: 'numeric'};
      if (sec > 1000 * 60 * 60) {
        options.hour = 'numeric';
      }

      return new Intl.DateTimeFormat('ru', options).format(d);
    };

    const formattedDuration = computed(() => getFormattedTime(props.duration));
    const formattedCurrentTime = computed(() => getFormattedTime(props.currentTime));


    /**
     * Qualities Select
     */
    const selectedQualityState = useVModel(props, 'selectedQuality', emit);

    return {
      currentTimeState,
      bufferedIndicator,
      playingState,
      volumeState,
      mutedState,
      formattedCurrentTime,
      formattedDuration,
      selectedQualityState,
    };
  },
});
</script>

<style scoped>
.control-panel {
  position: absolute;
  display: grid;
  bottom: 0;
  width: 100%;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.8547619731486344) 0%, rgba(0, 0, 0, 0) 100%);
  grid-template-columns: repeat(4, min-content) 1fr repeat(3, min-content);
  grid-template-rows: repeat(2, min-content);
  gap: 5px 10px;
  grid-template-areas:
    "progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar"
    "play-button next-button volume-area time space settings picture-in-picture fullscreen";
  padding: 5px;
  color: white;
}

.control-panel button, .control-panel a {
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
  text-decoration: none;
}

.control-panel button:not(:disabled):hover, .control-panel a:not(.disabled):hover {
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
  position: absolute;
  opacity: 0;
  top: 0;
  left: 0;
  cursor: pointer;
  --oversize: 3px;
  height: calc(100% + var(--oversize) + var(--oversize));
  margin: calc(-1 * var(--oversize)) 0;
}

.progress-bar input[type="range"]:hover {
  --oversize: 7px;
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

.picture-in-picture {
  grid-area: picture-in-picture;
}
</style>
