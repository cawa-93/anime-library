<template>
  <section class="control-panel">
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

    <volume-control
      :muted="muted"
      :volume="volume"
      @update:volume="v => $emit('update:volume', v)"
      @update:muted="v => $emit('update:muted', v)"
    />

    <span
      v-if="duration > 0"
      class="time"
    >
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
import VolumeControl from '/@/components/WatchPage/VideoPlayer/VolumeControl.vue';

export default defineComponent({
  name: 'ControlPanel',
  components: {VolumeControl, ProgressBar},
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
      formattedCurrentTime,
      formattedDuration,
      selectedQualityState,
    };
  },
});
</script>

<style scoped>
@import "video-control-button.css";

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
  grid-template-rows: 15px min-content;
  gap: 5px 10px;
  grid-template-areas:
    "progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar progress-bar"
    "play-button next-button volume-area time space subtitles settings picture-in-picture fullscreen";
  color: white;
  padding: 0 var(--control-panel-right-padding) var(--control-panel-bottom-padding) var(--control-panel-left-padding);
}


.progress-bar-container {
  grid-area: progress-bar;
}


.play-button {
  grid-area: play-button;
}

.next-button {
  grid-area: next-button;
}

volume-control {
  grid-area: volume-area;
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
