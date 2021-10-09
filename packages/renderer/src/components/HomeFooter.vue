<script lang="ts" setup>
import {ref} from 'vue';
import {trackEvent} from '/@/utils/telemetry';
import ExternalLink from '/@/components/ExternalLink.vue';
import {TG, VK, TG_CHAT, VK_CHAT} from '/@/utils/social-links';


const STATES = {
  INITIAL: 0,
  LIKED: 1,
  DISLIKED: 2,
} as const;

const state = ref<typeof STATES[keyof typeof STATES]>(STATES.INITIAL);

const like = () => {
  state.value = STATES.LIKED;
  trackEvent('UserSatisfactionSurvey', 'Satisfied');
};

const dislike = () => {
  state.value = STATES.DISLIKED;
  trackEvent('UserSatisfactionSurvey', 'NotSatisfied');
};
</script>


<template>
  <footer
    class="text-center p-3 grid grid-cols-2 gap-x-4 gap-y-2 card shadow-none rounded-none border-b-0 border-l-0 border-r-0"
  >
    <p class="col-span-full">
      {{
        state === STATES.INITIAL
          ? 'Вам нравится это приложение?'
          : state === STATES.LIKED
            ? 'Лучший способ помочь — рассказать о приложении друзьям и знакомым:'
            : 'Расскажите о своих идеях:'
      }}
    </p>
    <template v-if="state === STATES.INITIAL">
      <button
        type="button"
        class="btn justify-self-end"
        @click="like"
      >
        👍🏻 Да
      </button>

      <button
        type="button"
        class="btn justify-self-start"
        @click="dislike"
      >
        Нет 👎🏻
      </button>
    </template>
    <template v-else>
      <external-link
        :href="state === STATES.LIKED ? VK : VK_CHAT"
        class="btn justify-self-end"
      >
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 576 512"
        >
          <path
            fill="currentColor"
            d="M545 117.7c3.7-12.5 0-21.7-17.8-21.7h-58.9c-15 0-21.9 7.9-25.6 16.7 0 0-30 73.1-72.4 120.5-13.7 13.7-20 18.1-27.5 18.1-3.7 0-9.4-4.4-9.4-16.9V117.7c0-15-4.2-21.7-16.6-21.7h-92.6c-9.4 0-15 7-15 13.5 0 14.2 21.2 17.5 23.4 57.5v86.8c0 19-3.4 22.5-10.9 22.5-20 0-68.6-73.4-97.4-157.4-5.8-16.3-11.5-22.9-26.6-22.9H38.8c-16.8 0-20.2 7.9-20.2 16.7 0 15.6 20 93.1 93.1 195.5C160.4 378.1 229 416 291.4 416c37.5 0 42.1-8.4 42.1-22.9 0-66.8-3.4-73.1 15.4-73.1 8.7 0 23.7 4.4 58.7 38.1 40 40 46.6 57.9 69 57.9h58.9c16.8 0 25.3-8.4 20.4-25-11.2-34.9-86.9-106.7-90.3-111.5-8.7-11.2-6.2-16.2 0-26.2.1-.1 72-101.3 79.4-135.6z"
          />
        </svg>
        Открыть группу в VK
      </external-link>

      <external-link
        :href="state === STATES.LIKED ? TG : TG_CHAT"
        class="btn justify-self-start"
      >
        Открыть чат в Telegram
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
        >
          <path
            fill="currentColor"
            d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z"
          />
        </svg>
      </external-link>
    </template>
  </footer>
</template>


<style scoped>
svg {
  width: 1.2em;
}

.btn {
  @apply grid grid-flow-col items-center gap-2
}
</style>
