<script lang="ts" setup>
import { TransitionRoot, Dialog, DialogOverlay, DialogTitle, DialogDescription, TransitionChild } from '@headlessui/vue';
import {useVModel} from '@vueuse/core';
import AnimeCollectionEditorForm from '/@/pages/Home/AnimeCollection/AnimeCollectionEditorForm.vue';
import {ref} from 'vue';
import type {AnimeCollection} from '/@/pages/Home/AnimeCollection/AnimeCollectionDB';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  header: {
    type: String,
    required: false,
    default: '',
  },
});

const open = useVModel(props, 'isOpen');

const data = ref<Partial<AnimeCollection['requestParams'] & {title: string}>>({
  'limit': 10,
  'order': 'ranked',
});
</script>

<template>
  <TransitionRoot
    as="template"
    :show="open"
  >
    <Dialog
      as="div"
      class="fixed z-10 inset-0 overflow-y-auto"
      @close="open = false"
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
          <DialogOverlay class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
            <div class="card-header bg-black bg-opacity-5 dark:(bg-white bg-opacity-5) flex justify-between items-center">
              <DialogTitle
                as="h3"
                class="text-lg leading-6 font-medium"
              >
                {{ header }}
              </DialogTitle>
              <button
                type="button"
                class="btn win-icon"
                aria-label="Отменить изменения"
                @click="open = false"
              >
                &#xE8BB;
              </button>
            </div>

            <DialogDescription
              as="p"
              class="text-sm opacity-80 mb-3"
            >
              Укажите критерии для коллекции. Все аниме будут автоматически собираться по этим критериям и обновляться раз в
              несколько дней.
            </DialogDescription>

            <anime-collection-editor-form
              v-model:title="data.title"
              v-model:limit.number="data.limit"
              v-model:kind="data.kind"
              v-model:status="data.status"
              v-model:order="data.order"
              v-model:mylist="data.mylist"
              v-model:genre="data.genre"
            />

            <div class="card-footer flex justify-between gap-4 bg-black bg-opacity-5 dark:(bg-white bg-opacity-5)">
              <button
                type="button"
                class="btn rounded-md bg-red-600 hover:bg-red-700 dark:hover:bg-red-500 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                @click="open = false"
              >
                Удалить
              </button>
              <button
                ref="cancelButtonRef"
                type="button"
                class="btn btn-outline rounded-md border shadow-sm text-sm"
                @click="open = false"
              >
                Сохранить
              </button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>


<style scoped>
</style>
