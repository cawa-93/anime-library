<template>
  <slot
    name="activator"
    :openModal="openModal"
  >
    <button @click="openModal">
      Создать коллекцию
    </button>
  </slot>
  <anime-collection-edit
    v-if="isModalVisible"
    header="Создание коллекции"
    @save="saveCollection"
    @close="isModalVisible = false"
  />
</template>

<script lang="ts">
import {defineAsyncComponent, defineComponent, ref} from 'vue';
import type {AnimeCollection} from '/@/components/AnimeCollection/AnimeCollectionDB';
import {putCollection} from '/@/components/AnimeCollection/AnimeCollectionDB';

const AnimeCollectionEdit = defineAsyncComponent(() => import('/@/components/AnimeCollection/AnimeCollectionEditor.vue'));


export default defineComponent({
  name: 'AnimeCollectionCreate',
  components: {AnimeCollectionEdit},
  emits: {
    created: null,
  },
  setup(_, {emit}) {
    const isModalVisible = ref(false);

    const saveCollection = (newCollection: AnimeCollection) => {
      isModalVisible.value = false;
      return putCollection(newCollection).then(id => emit('created', id));
    };
    const openModal = () => isModalVisible.value = !isModalVisible.value;

    return {isModalVisible, saveCollection, openModal};
  },
});
</script>

<style scoped>

</style>
