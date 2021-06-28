<template>
  <ul>
    <li
      v-for="(item, index) of items"
      :key="index"
    >
      <slot
        name="item"
        v-bind="item"
      />
    </li>
  </ul>
</template>

<script lang="ts">
import {defineComponent} from 'vue';


export default defineComponent({
  name: 'HorizontalScroller',
  props: {
    items: {
      type: Array,
      required: false,
      default: () => ([]),
    },
  },
});
</script>

<style scoped>
ul {
  /*--size: 150px;*/
  --local-gap: var(--gap, 1rem);
  /*display: grid;*/
  /*grid-auto-flow: column;*/
  display: flex;
  gap: calc(var(--local-gap) / 2); /* parent owned value for children to be relative to*/
  margin: 0;
  overflow-x: auto;
  overscroll-behavior-inline: contain;

  padding-inline: var(--local-gap);
  scroll-padding-inline: var(--local-gap);
  padding-block: calc(var(--local-gap) / 2); /* make space for scrollbar and focus outline */
  scroll-snap-type: inline mandatory;
width: fit-content;
}

li {
  display: inline-block; /* removes the list-item bullet */
  scroll-snap-align: start;
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

/*a {*/
/*  width: var(--size);*/
/*  aspect-ratio: 1;*/
/*  display: block;*/
/*  color: white;*/
/*  background: #444488;*/
/*}*/
</style>
