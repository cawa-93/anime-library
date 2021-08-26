<script lang="ts" setup>
import {ref} from 'vue';
import {useTitle} from '@vueuse/core';
import HomeSearch from '/@/pages/Home/HomeSearch.vue';
import HomeFooter from '/@/pages/Home/HomeFooter.vue';
import type {AnimeCollection as AnimeCollectionType} from '/@/pages/Home/AnimeCollection/AnimeCollectionDB';
import {getAllCollections, getCollectionById} from '/@/pages/Home/AnimeCollection/AnimeCollectionDB';
import AnimeCollection from '/@/pages/Home/AnimeCollection/AnimeCollection.vue';
import AnimeCollectionCreate from '/@/pages/Home/AnimeCollection/AnimeCollectionCreateButton.vue';
import UserRating from '/@/components/UserRating.vue';


//
// Заголовок страницы
useTitle('Галерея аниме');


// Пользовательские Коллекции аниме
const userCollections = ref<{ data: AnimeCollectionType, id: number }[] | null>(null);
getAllCollections().then(all => userCollections.value = all);

const onCollectionCreated = (newCollectionId: number) => {
  getCollectionById(newCollectionId).then(collection => {
    if (!collection) {
      return;
    }

    if (!Array.isArray(userCollections.value)) {
      userCollections.value = [];
    }

    userCollections.value.push(collection);
  });
};

const onCollectionDeleted = (deletedId: number) => {
  if (!Array.isArray(userCollections.value)) {
    userCollections.value = [];
  } else {
    userCollections.value = userCollections.value.filter(({id}) => id !== deletedId);
  }
};
</script>

<template>
  <main>
    <user-rating />
    <div class="p-3 container-fluid">
      <home-search />
    </div>

    <template v-if="userCollections !== null">
      <anime-collection
        v-for="collection of userCollections"
        v-bind="collection.data"
        :id="collection.id"
        :key="collection.id"
        @deleted="onCollectionDeleted"
      />
    </template>

    <anime-collection-create @created="onCollectionCreated">
      <template #activator="{openModal}">
        <button
          class="btn btn-lg btn-outline-info d-block m-auto mt-4"
          @click="openModal"
        >
          Добавить коллекцию аниме
        </button>
      </template>
    </anime-collection-create>


    <home-footer class="mt-5 border-top" />
  </main>
</template>
