<template>
  <span
    v-if="duration > 0"
    class="d-flex gap-1 align-items-center text-nowrap pe-none"
  >
    <span aria-label="Текущее время">{{ formattedCurrentTime }}</span>
    /
    <span aria-label="Продолжительность эпизода">{{ formattedDuration }}</span>
  </span>
</template>

<script lang="ts">
import {computed, defineComponent} from 'vue';
import {getFormattedVideoTime} from '/@/utils/getFormattedVideoTime';


export default defineComponent({
  name: 'TimeCode',
  props: {
    currentTime: {
      type: Number,
      required: false,
      default: 0,
    },
    duration: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  setup(props) {
    const formattedDuration = computed(() => getFormattedVideoTime(props.duration));
    const formattedCurrentTime = computed(() => getFormattedVideoTime(props.currentTime));

    return {
      formattedCurrentTime,
      formattedDuration,
    };
  },
});
</script>
