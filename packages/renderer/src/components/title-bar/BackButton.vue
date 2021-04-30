<template>
  <button
    class="button"
    :disabled="isDisabled"
    @click="goBack"
  >
    <win-icon>&#xE830;</win-icon>
  </button>
</template>
<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import WinIcon from '/@/components/WinIcon.vue';
import {useRouter} from 'vue-router';

interface HistoryState {
  back: string | null
  current: string
}

export default defineComponent({
  name: 'BackButton',
  components: {WinIcon},
  setup() {
    const router = useRouter();

    const state = ref<HistoryState>(window.history.state);
    router.afterEach(() => {
      state.value = window.history.state;
    });

    const isDisabled = computed(() => !state.value.back && state.value.current === '/');

    const goBack = () => {
      if (state.value.back) {
        return router.back();
      }

      return router.replace({name: 'Home'});
    };

    return {goBack, isDisabled};
  },
});
</script>

<style scoped>
@import "button.css";

.button {
  width: auto;
  min-width: 50px;
  margin: -4px 4px -4px -4px;
  height: calc(100% + 8px);
}
</style>
