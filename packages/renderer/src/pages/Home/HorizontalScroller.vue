<script lang="ts" setup>
import type {PropType} from 'vue';

defineProps({
  items: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: Array as PropType<any[]>,
    required: false,
    default: () => ([]),
  },
});
</script>

<template>
  <ul>
    <li
      v-for="(item, index) of items"
      :key="index"
    >
      <slot
        name="item"
        :item="item"
      />
    </li>
  </ul>
</template>


<style scoped>
ul {
  --local-gap: var(--gap, 1rem);

  display: grid;
  grid-auto-columns: min-content;
  grid-auto-flow: column;
  overflow-x: auto;

  gap: calc(var(--local-gap) / 2); /* parent owned value for children to be relative to*/
  overscroll-behavior-inline: contain;

  padding-inline: var(--local-gap);
  scroll-padding-inline: var(--local-gap);
  padding-block: calc(var(--local-gap) / 2); /* make space for scrollbar and focus outline */
  scroll-behavior: smooth;
  scrollbar-width: thin;
}

ul:not(:hover)::-webkit-scrollbar {
  opacity: 0;
}
</style>
