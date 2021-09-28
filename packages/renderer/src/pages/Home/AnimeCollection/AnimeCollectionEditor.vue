<script lang="ts" setup>
import {
  Dialog as Dialog,
  DialogDescription as DialogDescription,
  DialogOverlay as DialogOverlay,
  DialogTitle as DialogTitle,
  TransitionChild as TransitionChild,
  TransitionRoot as TransitionRoot,
} from '@headlessui/vue';
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

  title: {
    type: String,
    required: false,
    default: '',
  },

  limit: {
    type: Number,
    required: false,
    default: 0,
  },

  status: {
    type: String,
    required: false,
    default: '',
  },

  kind: {
    type: String,
    required: false,
    default: '',
  },

  order: {
    type: String,
    required: true,
  },

  mylist: {
    type: String,
    required: false,
    default: '',
  },

  genre: {
    type: String,
    required: false,
    default: '',
  },

  onDelete: {
    type: Function,
    required: false,
    default: undefined,
  },
});

const emit = defineEmits({
  'save': null,
  'delete': null,
  'update:isOpen': null,
});

const formData = ref<Partial<AnimeCollection['requestParams'] & { title: string }>>({
  title: props.title,
  limit: props.limit,
  status: props.status,
  kind: props.kind,
  order: props.order,
  mylist: props.mylist,
  genre: props.genre,
});



const closePopup = () => {
  emit('update:isOpen', false);
};

const saveHandler = () => {
  const clearedData = Object.fromEntries(Object.entries(formData.value).filter((i) => !!i[1]));
  console.log(clearedData);
  emit('save', clearedData);

  closePopup();
};


const deleteHandler = () => {
  emit('delete');

  closePopup();
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
              class="card-header bg-black bg-opacity-5 dark:(bg-white bg-opacity-5) flex justify-between items-center"
            >
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
                @click="closePopup"
              >
                &#xE8BB;
              </button>
            </div>

            <DialogDescription
              as="p"
              class="text-sm opacity-80 mb-3"
            >
              Укажите критерии для коллекции. Все аниме будут автоматически собираться по этим критериям и обновляться
              раз в
              несколько дней.
            </DialogDescription>

            <anime-collection-editor-form
              v-model:title="formData.title"
              v-model:limit.number="formData.limit"
              v-model:kind="formData.kind"
              v-model:status="formData.status"
              v-model:order="formData.order"
              v-model:mylist="formData.mylist"
              v-model:genre="formData.genre"
            />

            <div class="card-footer flex flex-row-reverse justify-between gap-4 bg-black bg-opacity-5 dark:(bg-white bg-opacity-5)">
              <button
                ref="cancelButtonRef"
                type="submit"
                class="btn bg-accent rounded-md shadow-sm text-sm text-black"
                @click="saveHandler"
              >
                Сохранить
              </button>
              <button
                v-if="onDelete"
                type="button"
                class="btn bg-red rounded-md text-sm font-medium"
                @click="deleteHandler"
              >
                Удалить
              </button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
