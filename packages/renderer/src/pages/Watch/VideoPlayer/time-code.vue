<script lang="ts" setup>
import {computed} from 'vue';
import {getFormattedVideoTime} from '/@/utils/getFormattedVideoTime';


const props = defineProps({
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
});

const formattedDuration = computed(() => getFormattedVideoTime(props.duration));
const formattedCurrentTime = computed(() => getFormattedVideoTime(props.currentTime));
</script>

<template>
  <span
    v-if="duration > 0"
    class="flex gap-1 items-center whitespace-nowrap"
  >
    <span aria-label="Текущее время">{{ formattedCurrentTime }}</span>
    /
    <span aria-label="Продолжительность эпизода">{{ formattedDuration }}</span>
  </span>
</template>


