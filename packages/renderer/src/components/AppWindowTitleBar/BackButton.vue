<template>
  <button
    :disabled="isDisabled"
    title="Вернутся назад"
    class="btn rounded-0 py-0 border-0 d-flex align-items-center justify-content-center"
    @click="goBack"
  >
    <win-icon>&#xE830;</win-icon>
  </button>
</template>
<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import WinIcon from '/@/components/WinIcon.vue';
import {useRouter} from 'vue-router';

export default defineComponent({
  name: 'BackButton',
  components: {WinIcon},
  setup() {
    const router = useRouter();

    const history = ref({...window.history});

    router.afterEach(() => {
      history.value.length = window.history.length;
      history.value.state = window.history.state;
    });

    const canGoBack = computed(() => history.value.length > 1 && history.value.state.position > 0 && history.value.state.back !== null);
    const isDisabled = computed(() => !canGoBack.value && router.currentRoute.value.name === 'Home');

    const goBack = () => {

      /**
       * Странный хак. Исправляет возврат назад после перезагрузки страницы,
       * когда по каким-то причинам electron сбрасывает историю навигации
       */
      if (history.value.length === 1 && history.value.state.position === 1) {
        window.history.pushState(window.history.state, document.title);
        window.history.back();

        history.value.length = window.history.length;
        history.value.state = window.history.state;
      }

      router.back();
    };

    return {goBack, isDisabled};
  },
});
</script>

<style scoped>
@import "base-titlebar-button.css";

button:disabled {
  opacity: 0.3;
}
</style>
