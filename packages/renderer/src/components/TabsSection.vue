<template>
  <div
    class="btn-group d-flex position-sticky top-0"
    role="group"
    aria-label="Basic radio toggle button group"
  >
    <slot
      v-for="slotName of slots"
      :key="slotName"
      :name="SLOT_NAME_FOR_TABS_CONTROLS"
      :tab-name="slotName"
      :is-active="activeSlot === slotName"
      :activate="() => activateSlot(slotName)"
    />
  </div>

  <slot :name="activeSlot" />
</template>

<script lang="ts" setup>
import {ref, useSlots} from 'vue';

const props = defineProps({
  defaultActiveSlot: {
    type: [String, Number],
    required: false,
    default: '',
  },
});

const SLOT_NAME_FOR_TABS_CONTROLS = 'tab-header';

const slots = Object.keys(useSlots()).filter(name => name !== SLOT_NAME_FOR_TABS_CONTROLS);
const isValidSlotName = (name: string | number) => name !== '' && slots.includes(name);
const activeSlot = ref(isValidSlotName(props.defaultActiveSlot) ? props.defaultActiveSlot : slots[0]);

const activateSlot = (slotName: string | number) => {
  if (isValidSlotName(slotName)) {
    activeSlot.value = slotName;
  }
};
</script>

<style scoped>
.position-sticky {
  background-color: rgb(193, 193, 193);
  z-index: 3;
}

@media (prefers-color-scheme: dark) {
  .position-sticky {
    background-color: black;
  }
}
</style>
