<script lang="ts" setup>
import {computed, ref} from 'vue';
import {useRouter} from 'vue-router';


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

</script>

<template>
  <button
    :disabled="isDisabled"
    title="Вернутся назад"
    aria-label="Вернутся назад"
    class="btn-title-bar win-icon win-icon-sm disabled:opacity-30"
    @click="goBack"
  >
    &#xE830;
  </button>
</template>

<style scoped>
@import "./btn-titlebar.css";
</style>
