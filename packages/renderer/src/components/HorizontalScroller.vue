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

<script lang="ts">
import type {PropType} from 'vue';
import {defineComponent} from 'vue';


export default defineComponent({
  name: 'HorizontalScroller',
  props: {
    items: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: Array as PropType<any[]>,
      required: false,
      default: () => ([]),
    },
  },
});
</script>

<style scoped>
ul {
  --local-gap: var(--gap, 1rem);
  display: grid;
  grid-auto-flow: column;
  gap: calc(var(--local-gap) / 2); /* parent owned value for children to be relative to*/
  margin: 0;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  padding-inline: var(--local-gap);
  scroll-padding-inline: var(--local-gap);
  padding-block: calc(var(--local-gap) / 2); /* make space for scrollbar and focus outline */
  justify-content: flex-start;
}

li {
  display: inline-block;
  min-width: fit-content;
  min-height: fit-content;
}

li:last-of-type {
  position: relative;
}

li:last-of-type::after {
  content: "";
  position: absolute;
  inline-size: var(--local-gap);
  block-size: 100%;
  inset-block-start: 0;
  inset-inline-end: calc(var(--local-gap) * -1);
}

ul:not(:hover)::-webkit-scrollbar {
  opacity: 0;
}
</style>
