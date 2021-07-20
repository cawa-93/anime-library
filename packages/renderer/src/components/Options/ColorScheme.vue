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

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import {createIpcClient} from '/@/ipc';

const userSettings = createIpcClient('UserSettingsController');
const getScheme = () => userSettings.get('color_scheme', 'system');
const currentColorScheme = createIpcClient('ColorSchemeController');

export default defineComponent({
  name: 'ColorScheme',
  setup() {
    const _colorScheme = ref<'system' | 'light' | 'dark'>('system');
    getScheme().then(v => _colorScheme.value = v || 'system');

    const colorScheme = computed({
      get() {
        return _colorScheme.value;
      },
      set(v: 'system' | 'light' | 'dark') {
        _colorScheme.value = v;
        userSettings.set('color_scheme', v);
        currentColorScheme.setColorScheme(v);
      },
    });

    return {colorScheme};
  },
});
</script>
