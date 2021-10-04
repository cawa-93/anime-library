<script lang="ts" setup>
import {ref} from 'vue';
import {useTitle} from '@vueuse/core';
import HomeSearch from '/@/pages/Home/HomeSearch/HomeSearch.vue';
import HomeFooter from '/@/components/HomeFooter.vue';
import type {AnimeCollection as AnimeCollectionType} from '/@/pages/Home/AnimeCollection/AnimeCollectionDB';
import {getAllCollections, getCollectionById} from '/@/pages/Home/AnimeCollection/AnimeCollectionDB';
import AnimeCollection from '/@/pages/Home/AnimeCollection/AnimeCollection.vue';
import AnimeCollectionCreateButton from '/@/pages/Home/AnimeCollection/AnimeCollectionCreateButton.vue';
import UserRating from '/@/components/UserRating.vue';
import WelcomeDialog from '/@/pages/Home/WelcomeDialog.vue';


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
  <main class="grid auto-rows-min grid-cols-1 gap-6 pt-6 content-between">
    <user-rating />

    <div class="grid auto-rows-min grid-cols-1 gap-4">
      <h2 class="text-center text-lg opacity-50">
        Начните просмотр аниме:
      </h2>
      <home-search class="max-w-screen-md w-11/12 mx-auto" />
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

    <anime-collection-create-button @created="onCollectionCreated" />

    <home-footer class="mt-auto" />

    <WelcomeDialog />
  </main>
</template>
