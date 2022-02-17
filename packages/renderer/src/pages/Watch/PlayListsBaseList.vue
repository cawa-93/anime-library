<script lang="ts" setup>
import type {PropType} from 'vue';
import {onMounted, ref} from 'vue';
import type {PlayListItem} from '/@/pages/Watch/PlayListItem';


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
      :class="{'bg-accent font-bold': item.id === selectedItemId}"
      class="btn rounded-none flex items-center gap-1"
      :title="item.title || ''"
      @click.prevent="$emit('item-click', item)"
    >
      <span class="flex-grow inline-block truncate">{{ item.label }}</span>
      <small
        v-for="b of item.badges"
        :key="b.text"
        class="self-center"
        :class="b.class"
      >{{ b.text }}</small>
    </a>
  </nav>
</template>
