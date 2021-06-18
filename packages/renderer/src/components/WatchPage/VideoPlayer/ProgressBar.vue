<template>
  <div
    ref="bar"
    class="progress-bar-container"
    @mouseenter="isMouseIn = true"
    @mouseleave="isMouseIn = false"
  >
    <span
      ref="timeMark"
      class="position-relative text-white tooltip-inner bs-tooltip-top"
      role="tooltip"
      :style="`left: ${timeMarkLeft}px`"
    >
      {{ formattedExpectedTime }}
    </span>
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

    const timeMarkLeft = computed(() => {
      const timeMarkWidth = (timeMark.value === undefined ? 0 : timeMark.value.offsetWidth);
      const position = elementX.value - (timeMarkWidth / 2);

      return Math.min(Math.max(10, position), elementWidth.value - timeMarkWidth - 10);
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
      timeMarkLeft,
      timeMark,
      formattedExpectedTime,
      bufferedIndicator,
      cursorGradient,
      currentTimePersint,
      scrubbing,
      isMouseIn,
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
  pointer-events: none;
  top: -10px;
  opacity: 0;
}
.progress-bar-container:hover [role="tooltip"] {
  opacity: 1;
}

/*input[type=range] {*/
/*  --track-height: 8px;*/
/*  -webkit-appearance: none; !* Hides the slider so that custom slider can be made *!*/
/*  width: 100%; !* Specific width is required for Firefox. *!*/
/*  background: transparent;*/
/*  background: tomato; !* Otherwise white in Chrome *!*/
/*}*/

/*input[type=range]:focus {*/
/*  outline: none; !* Removes the blue border. You should probably do some kind of focus styling for accessibility reasons though. *!*/
/*}*/

/*input[type=range]::-ms-track {*/
/*  width: 100%;*/
/*  cursor: pointer;*/

/*  !* Hides the slider so custom styles can be added *!*/
/*  background: transparent;*/
/*  border-color: transparent;*/
/*  color: transparent;*/
/*}*/

/*input[type=range]::-webkit-slider-thumb {*/
/*  -webkit-appearance: none;*/
/*  !* border: 1px solid #000000; *!*/
/*  height: 16px;*/
/*  width: 16px;*/
/*  border-radius: 50%;*/
/*  background: #ffffff;*/
/*  cursor: pointer;*/
/*  !*margin-top: calc(-16px + var(--track-height));*!*/
/*  !* box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; *!*/
/*  !*transform: translateY(calc((16px - var(--track-height)) / 2));*!*/
/*}*/

/*input[type=range]::-webkit-slider-runnable-track {*/
/*  background-color: rgba(255, 255, 255, 0.25);*/
/*}*/
</style>
