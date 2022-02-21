<script lang="ts" setup>
import {DialogDescription} from '@headlessui/vue';
import AnimeCollectionEditorForm from '/@/pages/Home/AnimeCollection/AnimeCollectionEditorForm.vue';
import {ref} from 'vue';
import type {AnimeCollection} from '/@/pages/Home/AnimeCollection/AnimeCollectionDB';
import AppDialog from '/@/components/AppDialog.vue';


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
  emit('save', clearedData);

  closePopup();
};


const deleteHandler = () => {
  emit('delete');

  closePopup();
};


</script>

<template>
  <app-dialog
    :title="header"
    :is-open="isOpen"
    @update:is-open="v => $emit('update:isOpen', v)"
  >
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


    <div
      class="card-footer flex flex-row-reverse justify-between gap-4"
    >
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
  </app-dialog>
</template>
