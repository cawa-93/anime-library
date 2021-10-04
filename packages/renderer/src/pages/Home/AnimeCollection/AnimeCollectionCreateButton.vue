<script lang="ts" setup>
import {defineAsyncComponent, ref} from 'vue';
import type {AnimeCollection} from '/@/pages/Home/AnimeCollection/AnimeCollectionDB';
import {putCollection} from '/@/pages/Home/AnimeCollection/AnimeCollectionDB';


const AnimeCollectionEditor = defineAsyncComponent(() => import('/@/pages/Home/AnimeCollection/AnimeCollectionEditor.vue'));

const emit = defineEmits({
  created: null,
});

const isModalVisible = ref(false);

const saveCollection = (newCollectionData: AnimeCollection['requestParams'] & {title: AnimeCollection['title']}) => {
  const {title, ...requestParams} = newCollectionData;
  const newCollection = {title, requestParams};
  return putCollection(newCollection).then(id => emit('created', id));
};
const openModal = () => isModalVisible.value = !isModalVisible.value;
</script>


<template>
  <button
    class="btn btn-outline mx-auto"
    @click="openModal"
  >
    Создать коллекцию аниме
  </button>
  <anime-collection-editor
    v-model:is-open="isModalVisible"
    header="Создание коллекции"
    :limit="10"
    order="ranked"
    @save="saveCollection"
  />
</template>


<style scoped>

</style>
