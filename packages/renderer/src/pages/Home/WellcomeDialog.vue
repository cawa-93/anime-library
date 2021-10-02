<script lang="ts" setup>

import AppDialog from '/@/components/AppDialog.vue';
import OptionsAnime365 from '/@/pages/Options/OptionsAnime365/OptionsAnime365.vue';
import {computed, ref} from 'vue';
import {getAccessToken} from '/@/utils/videoProvider/providers/anime365/anime365';


const isConnected = ref(!!getAccessToken());
const isFirstRun = ref(sessionStorage.getItem('is-first-run') !== '1');

const isOpen = computed({
    get() {
      return !isConnected.value && isFirstRun.value;
    }, set(value) {
      if (value === false) {
        isFirstRun.value = false;
        sessionStorage.setItem('is-first-run', '1');
      }
    },
  },
);

const handlerSave = () => {
  isConnected.value = !!getAccessToken();
};
</script>

<template>
  <app-dialog
    v-model:is-open="isOpen"
    title="Перед началом"
  >
    <options-anime365 @save="handlerSave" />
  </app-dialog>
</template>
