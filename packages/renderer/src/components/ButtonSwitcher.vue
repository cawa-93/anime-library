<script lang="ts" setup>
import type {PropType} from 'vue';

defineProps({
  states: {
    type: Array as PropType<string[]>,
    required: true,
  },

  modelValue: {
    type: String,
    required: false,
    default: '',
  },

  groupName: {
    type: String,
    required: true,
  },
});

defineEmits({
  'update:modelValue': null,
});
</script>

<template>
  <fieldset class="relative">
    <input
      v-for="state of states"
      :key="state"
      class="absolute top-0 left-0 w-full h-full m-0 p-0 cursor-pointer appearance-none"
      :checked="state === modelValue"
      :value="state"
      :aria-label="state === 'include' ? 'Обязательно' : state === 'exclude' ? 'Исключить' : 'Без предпочтений'"
      type="radio"
      :name="groupName"
      @change="$emit('update:modelValue', state)"
    >
    <slot />
  </fieldset>
</template>

<style scoped>
input + input {
  z-index: -1;
}

input + input + input {
  z-index: -2;
}

input:checked + input {
  z-index: 1;
}
</style>
