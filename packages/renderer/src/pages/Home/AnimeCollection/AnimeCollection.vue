<script lang="ts" setup>
import type {PropType} from 'vue';
import {defineAsyncComponent, ref} from 'vue';
import type {Anime} from '/@/pages/Home/AnimeCollection/Anime';
import {apiFetch} from '/@/utils/shikimori-api';
import type {AnimeCollection} from '/@/pages/Home/AnimeCollection/AnimeCollectionDB';
import HorizontalScroller from '/@/pages/Home/HorizontalScroller.vue';
import CustomListSingleCard from '/@/pages/Home/AnimeCollection/AnimeCollectionSingleCard.vue';
import {
  deleteCollection as deleteCollectionFromDB,
  putCollection,
} from '/@/pages/Home/AnimeCollection/AnimeCollectionDB';


const AnimeCollectionEditor = defineAsyncComponent(() => import('/@/pages/Home/AnimeCollection/AnimeCollectionEditor.vue'));



const props = defineProps({
  id: {
    type: Number,
    required: true,
  },

  title: {
    type: String,
    required: false,
    default: '',
  },

  requestParams: {
    type: Object as PropType<AnimeCollection['requestParams']>,
    required: true,
  },
});
const emit = defineEmits({
  deleted: null,
});


const localTitle = ref(props.title);
const localSearchParams = ref(props.requestParams);
const isEditorOpened = ref(false);

const anime = ref<(Anime | null)[]>(Array(Number(props.requestParams.limit)).fill(null));
const errorText = ref('');
const isLoading = ref(true);

const searchAnime = (params: AnimeCollection['requestParams']) => {
  isLoading.value = true;
  const paramsNormalized = new URLSearchParams({
    ...params,
    limit: params.limit + '',// Convert to string for TS
    censored: 'false',
  });
  return apiFetch<Anime[]>(`animes?${paramsNormalized}`)
    .then(_anime => anime.value = _anime)
    .catch(e => {
      anime.value = [];
      errorText.value = typeof e === 'string' ? e : e instanceof Error ? e.toString() : JSON.stringify(e);
    })
    .finally(() => isLoading.value = false);
};


searchAnime(props.requestParams);

const updateCollection = (newCollection: AnimeCollection) => {
  isEditorOpened.value = false;
  putCollection(newCollection, props.id);

  localTitle.value = newCollection.title;

  let needReloadAnimes = Object
    .keys(newCollection.requestParams)
    .some((key) => newCollection.requestParams[key] !== localSearchParams.value[key]);


  if (!needReloadAnimes) {
    return;
  }

  localSearchParams.value = newCollection.requestParams;
  searchAnime(newCollection.requestParams);
};

const deleteCollection = () => {
  isEditorOpened.value = false;
  deleteCollectionFromDB(props.id).then(() => emit('deleted', props.id));
};
</script>



<template>
  <section>
    <h3
      v-if="localTitle"
      class="m-0"
    >
      {{ localTitle }}
    </h3>

    <anime-collection-editor
      v-if="isEditorOpened"
      :request-params="localSearchParams"
      header="Редактирование коллекции"
      :title="localTitle"
      :aria-label="`Редактирование коллекции ${localTitle}`"
      @save="updateCollection"
      @close="isEditorOpened = false"
      @delete="deleteCollection"
    />


    <button
      type="button"
      class="btn btn-lg win-icon"
      :title="`Изменить коллекцию ${localTitle}`"
      :aria-label="`Изменить коллекцию ${localTitle}`"
      @click="isEditorOpened = true"
    >
      &#xE713;
    </button>

    <horizontal-scroller
      v-if="anime.length > 0"
      :items="anime"
      class="animes"
      :aria-label="`Коллекция аниме ${localTitle}`"
    >
      <template #item="{item: singleAnime}">
        <custom-list-single-card
          v-if="singleAnime !== null"
          :anime="singleAnime"
          style="--size: 300px"
        />
        <div
          v-else
          class="h-100 card bg-gradient skeleton"
          style="height: 300px; aspect-ratio: 225 / 350"
        />
      </template>
    </horizontal-scroller>

    <p
      v-else
      class="lead p-3"
      style="height: 300px"
      :class="{
        'text-danger': errorText
      }"
    >
      {{ errorText ? errorText : 'Ничего не найдено' }}
    </p>
  </section>
</template>


<style scoped>
.skeleton {
  background-color: var(--bs-light);
  cursor: wait;
}

section {
  --gap: 1rem;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto max-content;
  gap: calc(var(--gap) / 2);
  grid-auto-flow: row;
  grid-template-areas:
    "title edit-button"
    "animes animes";
}

section:not(:first-of-type) {
  margin-top: calc(var(--gap) * 2);
}

h3 {
  grid-area: title;
  padding-inline-start: var(--gap);
  align-self: center;
}

.animes {
  grid-area: animes;
}

button {
  grid-area: edit-button;
  align-self: center;
}

</style>
