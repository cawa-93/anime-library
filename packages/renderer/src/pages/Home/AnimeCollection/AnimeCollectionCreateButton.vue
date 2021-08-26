<script lang="ts" setup>
import {defineAsyncComponent, ref} from 'vue';
import type {AnimeCollection} from '/@/pages/Home/AnimeCollection/AnimeCollectionDB';
import {putCollection} from '/@/pages/Home/AnimeCollection/AnimeCollectionDB';


const AnimeCollectionEdit = defineAsyncComponent(() => import('/@/pages/Home/AnimeCollection/AnimeCollectionEditor.vue'));

const emit = defineEmits({
  created: null,
});

const isModalVisible = ref(false);

const saveCollection = (newCollection: AnimeCollection) => {
  isModalVisible.value = false;
  return putCollection(newCollection).then(id => emit('created', id));
};
const openModal = () => isModalVisible.value = !isModalVisible.value;
</script>


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


<style scoped>

</style>
