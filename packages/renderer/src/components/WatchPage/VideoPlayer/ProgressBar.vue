<template>
  <div
    ref="bar"
    class="progress-bar-container position-relative"
    @mouseenter="isMouseIn = true"
    @mouseleave="isMouseIn = false"
  >
    <div
      v-if="isMouseIn"
      ref="timeMark"
      class="position-absolute bottom-0 d-flex flex-column gap-2 align-items-center"
      role="tooltip"
      :style="timeMarkStyle"
    >
      <img
        v-if="closestFrame"
        :src="closestFrame"
        class="border-3 border-white border rounded-1"
        height="100"
        alt=""
      >

      <span class="text-white tooltip-inner bs-tooltip-top">
        {{ formattedExpectedTime }}
      </span>
    </div>
    <div
      class="bar-container"
      @mousedown="scrubbing = true"
    >
      <div
        class="bar"
        :style="`background-image: ${bufferedIndicator} ${isMouseIn ? `, ${cursorGradient}` : ''};`"
      >
        <div
          class="current-time"
          :style="`width:${currentTimePersint * 100}%`"
        />
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import type {PropType} from 'vue';
import {computed, defineComponent, ref, watch} from 'vue';
import {useEventListener, useMouseInElement, useVModel} from '@vueuse/core';
import {HOUR} from '/@/utils/time';


export default defineComponent({
  name: 'ProgressBar',
  props: {
    duration: {
      type: Number,
      required: true,
    },
    time: {
      type: Number,
      required: true,
    },
    buffered: {
      type: Array as PropType<[number, number][]>,
      required: false,
      default: () => ([]),
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
    'update:time': null,
  },

  setup(props, {emit}) {
    const bar = ref();
    const timeMark = ref<HTMLElement | undefined>();
    const isMouseIn = ref(false);
    const currentTime = useVModel(props, 'time', emit);

    const {elementX, elementWidth} = useMouseInElement(bar);

    const timeMarkStyle = computed(() => {
      const timeMarkWidth = (!timeMark.value ? 0 : timeMark.value.offsetWidth);
      const minimalPadding = 10;
      if (elementX.value <= elementWidth.value / 2) {
        const position = Math.max(elementX.value - (timeMarkWidth / 2), minimalPadding);
        return {
          left: `${position}px`,
        };
      } else {
        const position = Math.max(elementWidth.value - elementX.value - timeMarkWidth / 2, minimalPadding);
        return {
          right: `${position}px`,
        };
      }
    });



    const getFormattedTime = (sec: number) => {
      const d = new Date(sec * 1000);

      const options: Intl.DateTimeFormatOptions = {minute: 'numeric', second: 'numeric', timeZone: 'UTC'};
      if (sec > HOUR) {
        options.hour = 'numeric';
      }

      return new Intl.DateTimeFormat('ru', options).format(d);
    };

    const expectedTime = computed(() => {
      if (elementWidth.value) {
        return Math.max(0, Math.min(props.duration, (props.duration / elementWidth.value) * elementX.value));
      }

      return 0;
    });
    const formattedExpectedTime = computed(() => getFormattedTime(expectedTime.value));

    const closestFrame = computed(() => {
      if (props.frames.step === 0) {
        return;
      }
      const t = Math.floor(expectedTime.value / props.frames.step) * props.frames.step + props.frames.step / 2;
      return props.frames.map.get(t);
    });


    /**
     * Buffered STATE
     */

    const defaultColorIndicator = 'rgba(255,255,255,0)';
    const bufferedColorIndicator = 'rgba(255,255,255,0.25)';

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

      return `linear-gradient(90deg, ${regions})`;
    });


    const cursorGradient = computed(() => {
      return isMouseIn.value ? `linear-gradient(90deg, ${bufferedColorIndicator} 0%, ${bufferedColorIndicator} ${elementX.value}px, ${defaultColorIndicator} ${elementX.value}px, ${defaultColorIndicator} 100%);` : '';
    });


    const currentTimePersint = computed(() => props.duration === 0 ? 0 : currentTime.value / props.duration);


    const scrubbing = ref(false);
    useEventListener('mouseup', () => scrubbing.value = false);
    watch([scrubbing, expectedTime], () => {
      if (scrubbing.value) {
        currentTime.value = expectedTime.value;
      }
    });

    return {
      bar,
      timeMarkStyle,
      timeMark,
      formattedExpectedTime,
      bufferedIndicator,
      cursorGradient,
      currentTimePersint,
      scrubbing,
      isMouseIn,
      closestFrame,
    };
  },
});
</script>

<style scoped>
.bar-container {
  --overload: 0.5rem;
  padding-top: var(--overload);
  padding-bottom: var(--overload);
  margin-top: calc(-1 * var(--overload));
  margin-bottom: calc(-1 * var(--overload));
  cursor: pointer;
}

.bar {
  background-color: rgba(255, 255, 255, 0.25);
  height: 5px;
}

.bar .current-time {
  background-color: white;
  height: 100%;
}

.progress-bar-container [role="tooltip"] {
  pointer-events: none !important;
  bottom: 10px;
  width: min-content;
  overflow-x: hidden;
}
</style>
