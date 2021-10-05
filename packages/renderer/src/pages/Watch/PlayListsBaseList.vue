<script lang="ts" setup>
import type {PropType} from 'vue';
import {onMounted, ref} from 'vue';


export interface PlayListItem {
  id: number,
  label: string,
  title?: string,
  badges?: { text: string, class: string }[]
}


defineProps({
  items: {
    type: Array as PropType<PlayListItem[]>,
    required: true,
  },
  selectedItemId: {
    type: Number,
    required: false,
    default: null,
  },
});

defineEmits({
  'item-click': null,
});

const root = ref<HTMLElement>();

onMounted(() => {
  const activeElement = root.value?.querySelector<HTMLElement>('.bg-accent');
  if (activeElement) {
    activeElement.scrollIntoViewIfNeeded();
  }
});
</script>

<template>
  <nav ref="root">
    <a
      v-for="item of items"
      :key="item.id"
      href="#"
      :class="{'bg-accent': item.id === selectedItemId}"
      class="btn rounded-none flex items-center"
      :title="item.title || ''"
      @click.prevent="$emit('item-click', item)"
    >
      <span class="flex-grow inline-block truncate">{{ item.label }}</span>
      <small
        v-for="b of item.badges"
        :key="b.text"
        style="margin-left: 0.1em"
        class="badge self-center"
        :class="b.class"
      >{{ b.text }}</small>
    </a>
  </nav>
</template>

<style scoped>
/*.list-group-item {*/
/*  content-visibility: auto;*/
/*  contain-intrinsic-size: 24px;*/
/*}*/

/*.list-group-item:not(.active) {*/
/*  background: none;*/
/*}*/

/*.list-group-item:hover:not(.active), .list-group-item:focus-visible:not(.active) {*/
/*  background-color: rgba(0, 0, 0, 0.05) !important;*/
/*}*/
</style>
