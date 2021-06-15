<template>
  <div
    class="btn-group d-flex position-sticky top-0"
    role="group"
    aria-label="Basic radio toggle button group"
  >
    <slot
      v-for="slotName of slotsNames"
      :key="slotName"
      name="tab-header"
      :tab-name="slotName"
      :is-active="activeTab === slotName"
      :select="() => activeTab = slotName"
    />
  </div>

  <slot :name="activeTab" />
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';


export default defineComponent({
  name: 'TabsSection',

  props: {
    defaultTab: {
      type: String,
      required: false,
      default: '',
    },
  },

  setup(props, {slots}) {
    const slotsNames = Object.keys(slots).filter(name => name !== 'tab-header');
    const activeTab = ref(props.defaultTab || slotsNames[0]);
    return {slotsNames, activeTab};
  },
});
</script>

<style scoped>
.position-sticky {
  background-color: rgb(193,193,193);
  z-index: 3;
}
</style>
