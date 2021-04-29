<template>
  <button
    id="back"
    class="button"
    :disabled="!state.back"
    @click="goBack"
  >
    <win-icon>&#xE830;</win-icon>
  </button>
</template>
<script lang="ts">
import {defineComponent, ref} from 'vue';
import WinIcon from '/@/components/WinIcon.vue';
import {useRouter} from 'vue-router';

interface HistoryState {
  back: string | null
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

    const goBack = () => router.back();

    return {goBack, state};
  },
});
</script>

<style scoped>
@import "button.css";

#back {
  width: auto;
  min-width: 50px;
  margin: -4px 4px -4px -4px;
  height: calc(100% + 8px);
}
</style>
