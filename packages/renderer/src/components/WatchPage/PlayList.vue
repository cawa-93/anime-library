<template>
  <nav
    ref="root"
    class="list-group list-group-flush"
  >
    <a
      v-for="item of items"
      :key="item.id"
      href="#"
      :class="{active: item.id === selectedItemId}"
      class="list-group-item"
      :title="item.title || ''"
      @click.prevent="$emit('item-click', item)"
    >
      <span class="d-flex item-label text-truncate">
        <span class="flex-fill d-inline-block text-truncate">{{ item.label }}</span>
        <small
          v-for="b of item.badges"
          :key="b.text"
          style="margin-left: 0.1em"
          class="badge align-self-center"
          :class="`bg-${b.style} ${['warning', 'info', 'light'].includes(b.style) ? 'text-dark' : ''}`"
        >{{ b.text }}</small>
      </span>
    </a>
  </nav>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {defineComponent, onMounted, ref} from 'vue';


export interface PlayListItem {
  id: number,
  label: string,
  title?: string,
  badges?: {text: string, style: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'}[]
}


export default defineComponent({
  name: 'PlayList',

  props: {
    items: {
      type: Array as PropType<PlayListItem[]>,
      required: true,
    },
    selectedItemId: {
      type: Number,
      required: false,
      default: null,
    },
  },

  emits: ['item-click'],

  setup() {
    const root = ref<HTMLElement>();

    onMounted(() => {
      const activeElement = root.value?.querySelector<HTMLElement>('.active');
      if (activeElement) {
        activeElement.scrollIntoViewIfNeeded();
      }
    });

    return {root};
  },
});
</script>

<style scoped>
.list-group-item {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 25px 1fr;
  content-visibility: auto;
  contain-intrinsic-size: 24px;
}

.list-group-item:not(.active) {
  background: none;
  color: inherit;
}

.list-group-item:hover:not(.active), .list-group-item:focus-visible:not(.active) {
  background-color: rgba(0, 0, 0, 0.05) !important;
}

.item-label {
  grid-column-start: 2;
}
</style>
