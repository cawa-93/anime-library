<template>
  <transition name="slide">
    <div
      v-if="visible"
      class="alert alert-success position-absolute m-0 py-2 bg-body shadow-lg d-flex align-items-center gap-2"
      role="alert"
    >
      {{ emoji }}
      <p class="m-0">
        Вы заняли <b>{{ top }}-е</b> место по просмотру аниме на прошлой неделе!
      </p>
      <button
        type="button"
        class="btn win-icon"
        aria-label="Закрыть"
        @click="close"
      >
        &#xE8BB;
      </button>
    </div>
  </transition>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';


const RATING_SOURCE = 'https://raw.githubusercontent.com/cawa-93/anime-library-stat/main/users-stat.json';
const LOCAL_STORAGE_LAST_UPDATED_AT_KEY = 'user_rating/last_updated_at';


interface UserStats {
  updated_at: number,
  rating: [string, number][]
}


export default defineComponent({
  name: 'UserRating',
  setup() {
    const uuid = localStorage.getItem('uuid');
    const top = ref(0);
    const visible = ref(!false);

    const emoji = computed(() => {
      if (top.value === 0) return '';
      if (top.value < 3) return '🎉';
      if (top.value < 10) return '😍';
      return '👍';
    });

    let _localUpdatedAt = 0;
    if (uuid) {

      /**
       * Временная отметка последнего проверенного отчета
       */
      const lastCheckAt = localStorage.getItem(LOCAL_STORAGE_LAST_UPDATED_AT_KEY) || 0;
      fetch(RATING_SOURCE).then<UserStats>(r => r.json()).then(({rating, updated_at}) => {

        /**
         * Если время сохдания загруженного меньше чем время последнего проверенного - не делать ничего
         */
        if (updated_at <= lastCheckAt) {
          return;
        }

        /**
         * Позиция текущего пользователя в рейтинге
         * 0 -- если текущего пользователя нет в рейтинге
         */
        top.value = rating.findIndex(([id]) => id === uuid) + 1;

        if (top.value > 0) {
          visible.value = true;
        }

        /**
         * Сохранить время отчета во временную переменную
         * Она необзодимо в момент закрытия уведомления
         */
        _localUpdatedAt = updated_at;
      }).catch(e => console.error(e));
    }

    const close = () => {
      visible.value = false;
      if (_localUpdatedAt) {
        localStorage.setItem(LOCAL_STORAGE_LAST_UPDATED_AT_KEY, String(_localUpdatedAt));
      }
    };

    return {top, close, emoji, visible};
  },
});
</script>

<style scoped>
.alert {
  z-index: 50;
  left: 50%;
  --translateX: -50%;
  --translateY: 0;
  transform: translate(var(--translateX, 0), var(--translateY, 0));
  width: fit-content;
  max-width: 100%;
  border-left-width: 5px;
}

@media (prefers-color-scheme: dark) {
  .bg-body {
    background-color: var(--input-bg);
  }
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.5s cubic-bezier(0.18, 0.13, 0.27, 1.55)
}

.slide-enter-to, .slide-leave-from {
  --translateY: 0;
}

.slide-enter-from, .slide-leave-to {
  --translateY: -200%;
}
</style>
