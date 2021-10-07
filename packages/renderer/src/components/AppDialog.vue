<script lang="ts" setup>
import {
  Dialog as Dialog,
  DialogOverlay as DialogOverlay,
  DialogTitle as DialogTitle,
  TransitionChild as TransitionChild,
  TransitionRoot as TransitionRoot,
} from '@headlessui/vue';


defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },

  title: {
    type: String,
    required: false,
    default: '',
  },
});

const emit = defineEmits({
  'update:isOpen': null,
});

const closePopup = () => {
  emit('update:isOpen', false);
};

</script>

<template>
  <TransitionRoot
    as="template"
    :show="isOpen"
  >
    <Dialog
      as="div"
      class="fixed z-10 inset-0 overflow-y-auto"
      @close="closePopup"
    >
      <div class="h-full grid justify-center items-center">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay class="fixed inset-0 bg-true-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div
            class="card inline-block align-center rounded-lg shadow-xl transform transition-all max-w-2xl w-full my-2"
            style="overflow: unset"
          >
            <div
              class="card-header flex justify-between items-center"
            >
              <DialogTitle
                as="h3"
                class="text-lg leading-6 font-medium"
              >
                {{ title }}
              </DialogTitle>
              <button
                type="button"
                class="btn win-icon"
                aria-label="Закрыть диалог"
                @click="closePopup"
              >
                &#xE8BB;
              </button>
            </div>

            <slot />
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
