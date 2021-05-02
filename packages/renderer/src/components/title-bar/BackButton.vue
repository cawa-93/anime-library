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
        console.warn('Невозможно вернуться назад. Обновляю стек истории');
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
@import "button.css";

.button {
  width: auto;
  min-width: 50px;
  margin: -4px 4px -4px -4px;
  height: calc(100% + 8px);
}
</style>
