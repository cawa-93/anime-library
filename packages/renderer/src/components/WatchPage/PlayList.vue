<template>
  <nav
    ref="root"
    class="list-group list-group-flush"
  >
    <router-link
      v-for="item of items"
      :key="item.id"
      :class="{active: item.id === selectedItemId}"
      class="list-group-item"
      :to="item.url"
      replace
      :title="item.title || ''"
      @click="$emit('item-click', item)"
    >
      <win-icon
        v-if="item.id === selectedItemId"
        class="play-icon"
      >
        &#xF5B0;
      </win-icon>
      <span class="item-text">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {defineComponent, onMounted, ref} from 'vue';
import WinIcon from '/@/components/WinIcon.vue';
import type {RouteLocationRaw} from 'vue-router';


export interface PlayListItem {
  id: number,
  label: string,
  title?: string,
  url: RouteLocationRaw
}


export default defineComponent({
  name: 'PlayList',

  components: {
    WinIcon,
  },
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
}

.list-group-item:not(.active) {
  background: none;
  color: inherit;
}

.list-group-item:hover:not(.active), .list-group-item:focus-visible:not(.active) {
  background-color: rgba(0, 0, 0, 0.05) !important;
}

.item-text {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  grid-column-start: 2;
}
</style>
