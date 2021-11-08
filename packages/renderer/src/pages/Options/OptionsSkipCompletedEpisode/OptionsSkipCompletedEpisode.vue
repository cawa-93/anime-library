<script lang="ts" setup>
import {ref, watch} from 'vue';
import {getState, setState} from '/@/pages/Options/OptionsSkipCompletedEpisode/store';


const state = ref(getState());
watch(state, value => {
  setState(value);
});
</script>

<template>
  <form>
    <p>
      Откуда продолжать воспроизведение если вы остановили просмотр на эндинге?
    </p>
    <label class="block mt-3">
      <input
        v-model="state"
        type="radio"
        name="OptionsSkipCompletedEpisode"
        :value="false"
      >
      Продолжать ровно с того же места.
    </label>
    <p class="text-sm opacity-60 ml-4">
      Позволяет вспомнить на чем вы остановились или не пропустить сцену после титров.
    </p>
    <label class="block mt-3">
      <input
        v-model="state"
        type="radio"
        name="OptionsSkipCompletedEpisode"
        :value="true"
      >
      Пропустить эндинг и продолжить сразу со следующего эпизода.
    </label>
    <p class="text-sm opacity-60 ml-4">
      Позволяет не тратить время на загрузку законченного эпизода, а сразу запускать следующий.
    </p>
  </form>
</template>
