<template>
  <section class="control-panel">
    <!--    <div class="progress-bar-container">-->
    <!--      <progress-->
    <!--        :style="`&#45;&#45;gradient: ${bufferedIndicator}`"-->
    <!--        :max="duration"-->
    <!--        :value="currentTimeState"-->
    <!--      />-->

    <!--      <input-->
    <!--        v-model.number="currentTimeState"-->
    <!--        type="range"-->
    <!--        min="0"-->
    <!--        :max="duration"-->
    <!--      >-->
    <!--    </div>-->

    <progress-bar
      v-model:time="currentTimeState"
      :frames="frames"
      class="progress-bar-container"
      :duration="duration"
      :buffered="buffered"
    />

    <button
      class="play-button win-icon"
      :title="`${playingState ? 'Пауза' : 'Смотреть'} (k)`"
      @click="playingState = !playingState"
    >
      {{ playingState ? '&#xE769;' : '&#xE768;' }}
    </button>

    <button
      :disabled="!hasNextEpisode"
      class="next-button win-icon"
      title="Следующий эпизод"
      @click="$emit('go-to-next-episode')"
    >
      &#xE893;
    </button>

    <div class="volume-area">
      <button
        class="win-icon"
        :title="mutedState ? 'Включить звук' : 'Отключение звука'"
        @click="mutedState = !mutedState"
      >
        {{
          volumeState === 0 ? '&#xE74F;'
          : volumeState > 0.75 ? '&#xE995;'
            : volumeState > 0.50 ? '&#xE994;'
              : volumeState > 0.25 ? '&#xE993;'
                : '&#xE992;'
        }}
      </button>

      <input
        v-model.number="volumeState"
        :aria-valuetext="`${volumeState * 100}% громкость`"
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

    <button
      v-if="hasSubtitles"
      title="Субтитры"
      class="subtitles"
      @click="$emit('update:isSubtitlesEnabled', !isSubtitlesEnabled)"
    >
      <span
        class="win-icon"
        :style="!isSubtitlesEnabled ? 'opacity: 0.5' : ''"
        aria-hidden="true"
      >
        &#xED1E;
      </span>
    </button>

    <select
      v-if="qualities.length > 0"
      v-model="selectedQualityState"
      title="Качество"
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
      title="Картинка-в-картинке"
      class="picture-in-picture win-icon"
      @click="$emit('requestPictureInPicture')"
    >
      {{ isPictureInPicture ? '&#xE944;' : '&#xE8A7;' }}
    </button>

    <button
      :title="`${isFullscreen ? 'Выход из полноэкранного режима' : 'Во весь экран'} (f)`"
      class="toggle-fullscreen-button win-icon"
      @click="$emit('requestFullscreenToggle')"
    >
      {{ isFullscreen ? '&#xE73F;' : '&#xE740;' }}
    </button>
  </section>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {computed, defineComponent} from 'vue';
import {useVModel} from '@vueuse/core';
import type {VideoTrack} from '/@/utils/videoProvider';
import ProgressBar from '/@/components/WatchPage/VideoPlayer/ProgressBar.vue';

export default defineComponent({
  name: 'ControlPanel',
  components: {ProgressBar},
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
    hasNextEpisode: {
      type: Boolean,
      required: false,
      default: false,
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
    hasSubtitles: {
      type: Boolean,
      required: false,
      default: false,
    },
    isSubtitlesEnabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    tracks: {
      type: Array as PropType<VideoTrack[]>,
      required: false,
      default: () => [],
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
    frames: {
      type: Object as PropType<{ step: number, map: Map<number, string> }>,
      required: false,
      default: () => ({
        step: 0,
        map: new Map,
      }),
    },
  },

  emits: {
    'update:currentTime': null,
    'update:playing': null,
    'update:volume': null,
    'update:muted': null,
    'update:selectedQuality': null,
    'requestFullscreenToggle': null,
    'requestPictureInPicture': null,
    'update:isSubtitlesEnabled': null,
    'go-to-next-episode': null,
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

      const options: Intl.DateTimeFormatOptions = {minute: 'numeric', second: 'numeric', timeZone: 'UTC'};
      if (sec > 60 * 60) {
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
  --control-panel-bottom-padding: 8px;
  --control-panel-left-padding: 10px;
  --control-panel-right-padding: 10px;
  position: absolute;
  display: grid;
  bottom: 0;
  width: 100%;
  background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
  grid-template-columns: repeat(4, min-content) 1fr repeat(4, min-content);
  grid-template-rows: repeat(2, min-content);
  gap: 5px 10px;
  grid-template-areas:
    "progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar"
    "play-button next-button volume-area time space subtitles settings picture-in-picture fullscreen";
  color: white;
  padding: 0 var(--control-panel-right-padding) var(--control-panel-bottom-padding) var(--control-panel-left-padding);
}

.control-panel button, .control-panel a {
  border: none;
  padding: 0;
  color: inherit;
  background: transparent;
  border-radius: 3px;
  font-size: 18px;
  width: 2em;
  height: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  position: relative;
}

.control-panel button:active, .control-panel a:active {
  align-items: flex-end;
}

.control-panel button:before, .control-panel a:before, .control-panel select:before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: calc(100% + var(--control-panel-bottom-padding));
}

.control-panel button:first-of-type:before {
  width: calc(100% + var(--control-panel-left-padding));
}

.control-panel button:last-of-type:before {
  width: calc(100% + var(--control-panel-right-padding));
  left: 0;
  right: auto;
}


.control-panel button:not(:disabled):hover, .control-panel a:not([aria-disabled="true"]):hover {
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
}

.control-panel button:disabled, .control-panel a[aria-disabled="true"] {
  opacity: 0.3;
}

.progress-bar-container {
  grid-area: progress-bar;
  /*flex: 1;*/
  /*position: relative;*/
  /*display: flex;*/
  /*align-items: center;*/
}

/*.progress-bar-container progress {*/
/*  width: 100%;*/
/*  -webkit-appearance: none;*/
/*  appearance: none;*/
/*  height: 5px;*/
/*  background-color: rgba(255, 255, 255, 0.2);*/
/*}*/

/*.progress-bar-container progress[value]::-webkit-progress-bar {*/
/*  width: 100%;*/
/*  !*noinspection CssUnresolvedCustomProperty*!*/
/*  background: var(--gradient);*/
/*  border-radius: 2px;*/
/*}*/

/*.progress-bar-container progress[value]::-webkit-progress-value {*/
/*  background-color: cornflowerblue;*/
/*}*/

/*.progress-bar-container input[type="range"] {*/
/*  width: 100%;*/
/*  position: absolute;*/
/*  opacity: 0;*/
/*  top: 0;*/
/*  left: 0;*/
/*  cursor: pointer;*/
/*  --oversize: 3px;*/
/*  height: calc(100% + var(--oversize) + var(--oversize));*/
/*  margin: calc(-1 * var(--oversize)) 0;*/
/*}*/

/*.progress-bar-container input[type=range]:hover {*/
/*  --oversize: 7px;*/
/*}*/

/*.progress-bar-container input[type=range]::-webkit-slider-thumb {*/
/*  visibility: hidden;*/
/*}*/

/*.progress-bar-container input[type=range]::-webkit-slider-runnable-track {*/
/*  visibility: hidden;*/
/*}*/

.play-button {
  grid-area: play-button;
}

.next-button {
  grid-area: next-button;
}

.volume-area {
  grid-area: volume-area;
  display: flex;
  gap: 5px 10px;
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
  cursor: pointer;
}

.settings:hover {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

select.settings option {
  background: rgba(0, 0, 0, 0.8);
}

.picture-in-picture {
  grid-area: picture-in-picture;
}

.subtitles {
  grid-area: subtitles;
}
</style>
