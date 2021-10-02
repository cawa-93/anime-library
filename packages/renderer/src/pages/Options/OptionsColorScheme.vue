<script lang="ts" setup>
import {computed, ref} from 'vue';
import {getScheme, setScheme} from '/@/pages/Options/settingColorScheme';


const _colorScheme = ref<'system' | 'light' | 'dark'>('system');
getScheme().then(v => _colorScheme.value = v || 'system');

const colorScheme = computed({
  get() {
    return _colorScheme.value;
  },
  set(v: 'system' | 'light' | 'dark') {
    _colorScheme.value = v;
    setScheme(v);
  },
});
</script>

<template>
  <fieldset>
    <label>
      <input
        v-model="colorScheme"
        value="system"
        type="radio"
        name="color-scheme"
      >
      Системная
    </label>

    <label>
      <input
        v-model="colorScheme"
        value="light"
        type="radio"
        name="color-scheme"
      >
      Светлая
    </label>

    <label>
      <input
        v-model="colorScheme"
        value="dark"
        type="radio"
        name="color-scheme"
      >
      Тёмная
    </label>
  </fieldset>
</template>

<style scoped>
label {
  @apply block;
}
</style>
