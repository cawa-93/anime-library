<script lang="ts" setup>
import {defineAsyncComponent, ref} from 'vue';
import type {AnimeCollection} from '/@/pages/Home/AnimeCollection/AnimeCollectionDB';
import {putCollection} from '/@/pages/Home/AnimeCollection/AnimeCollectionDB';


const AnimeCollectionEditor = defineAsyncComponent(() => import('/@/pages/Home/AnimeCollection/AnimeCollectionEditor.vue'));

const emit = defineEmits({
  created: null,
});

const isModalVisible = ref(!false);

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
    <button
      class="btn btn-outline"
      @click="openModal"
    >
      Создать коллекцию
    </button>
  </slot>
  <anime-collection-editor
    v-model:is-open="isModalVisible"
    header="Создание коллекции"
    @save="saveCollection"
  />
</template>


<style scoped>

</style>
