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
  <div class="form-check">
    <input
      id="system-color-scheme"
      v-model="colorScheme"
      value="system"
      class="form-check-input"
      type="radio"
      name="color-scheme"
    >
    <label
      class="form-check-label"
      for="system-color-scheme"
    >Системная</label>
  </div>
  <div class="form-check">
    <input
      id="light-color-scheme"
      v-model="colorScheme"
      value="light"
      class="form-check-input"
      type="radio"
      name="color-scheme"
    >
    <label
      class="form-check-label"
      for="light-color-scheme"
    >Светлая</label>
  </div>
  <div class="form-check">
    <input
      id="dark-color-scheme"
      v-model="colorScheme"
      value="dark"
      class="form-check-input"
      type="radio"
      name="color-scheme"
    >
    <label
      class="form-check-label"
      for="dark-color-scheme"
    >Темная</label>
  </div>
</template>
