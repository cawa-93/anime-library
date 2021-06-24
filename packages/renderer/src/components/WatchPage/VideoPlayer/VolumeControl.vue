<template>
  <div
    class="volume-control d-flex"
    :class="{expanded}"
  >
    <button
      class="win-icon"
      :title="muted ? 'Включить звук' : 'Отключение звука'"
      @click="$emit('update:muted', !muted)"
    >
      {{
        muted || volume === 0 ? '&#xE74F;'
        : volume > 0.75 ? '&#xE995;'
          : volume > 0.50 ? '&#xE994;'
            : volume > 0.25 ? '&#xE993;'
              : '&#xE992;'
      }}
    </button>

    <input
      :aria-valuetext="`${volume * 100}% громкость`"
      type="range"
      min="0"
      max="1"
      step="0.01"
      :value="muted ? 0 : volume"
      @input="volumeUpdateHandler"
    >
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, watch} from 'vue';
import {useDebounceFn} from '@vueuse/core';


/**
 * Хранит последнее значение громкости
 * Необходима чтобы отслеживать изменилась ли громкость с момента когда компонент был смонтирован в последний раз
 */
let lastVolumeValue: null | number = null;

export default defineComponent({
  name: 'VolumeControl',
  props: {
    volume: {
      type: Number,
      required: true,
    },
    muted: {
      type: Boolean,
      required: true,
    },
  },

  emits: {
    'update:volume': (v: unknown) => typeof v === 'number',
    'update:muted': null,
  },

  setup(props, {emit}) {

    /**
     * Если с момента последнего монтирования компонента громкость изменилась
     * Развернуть ползунок громкости по умолчанию
     */
    const expanded = ref(lastVolumeValue !== null && lastVolumeValue !== props.volume);
    const collapseAfterTimeout = useDebounceFn(() => expanded.value = false, 1500);

    if (expanded.value) {
      collapseAfterTimeout();
    }

    // eslint-disable-next-line vue/no-setup-props-destructure
    lastVolumeValue = props.volume;

    watch(() => props.volume, () => {
      lastVolumeValue = props.volume;
      expanded.value = true;
      collapseAfterTimeout();
    });

    const volumeUpdateHandler = (event: Event) => {
      if (!event.target || !(event.target instanceof HTMLInputElement)) {
        throw new Error(`Got event.target as ${typeof event.target} but HTMLInputElement was expected`);
      }

      emit('update:muted', false);
      emit('update:volume', event.target.valueAsNumber);
    };

    return {expanded, volumeUpdateHandler};
  },
});
</script>

<style scoped>
@import "video-control-button.css";

.volume-control {
  column-gap: 10px;
}

input[type="range"] {
  appearance: none;
  background-color: transparent;
  transition: width 200ms;
  width: 0;
  cursor: e-resize;
  margin-bottom: calc(-1 * var(--control-panel-bottom-padding, 0px));
  padding-bottom: var(--control-panel-bottom-padding, 0px);
}

.volume-control.expanded input[type="range"],
.volume-control:hover input[type="range"],
.volume-control:focus-within input[type="range"] {
  width: 150px;
}

input[type='range']::-webkit-slider-runnable-track {
  -webkit-appearance: none;
  overflow: hidden;
  height: 5px;
  background: #ffffff3d;
}

input[type='range']::-webkit-slider-thumb {
  width: 10px;
  -webkit-appearance: none;
  height: 10px;
  cursor: ew-resize;
  background: white;
  border-radius: 10px;
  box-shadow: -80px 0 0 80px rgba(255, 255, 255, 0.8);
}
</style>
