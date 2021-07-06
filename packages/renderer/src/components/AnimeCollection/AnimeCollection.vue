<template>
  <section>
    <h3
      v-if="localTitle"
      class="m-0"
    >
      {{ localTitle }}
    </h3>

    <anime-collection-edit
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
      v-if="animes.length > 0"
      :items="animes"
      class="animes"
      :aria-label="`Коллекция аниме ${localTitle}`"
    >
      <template #item="{item: anime}">
        <custom-list-single-card
          v-if="anime !== null"
          :anime="anime"
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

<script lang="ts">
import type {PropType} from 'vue';
import {defineComponent, ref} from 'vue';
import type {Anime} from '/@/components/AnimeCollection/Anime';
import {apiFetch} from '/@/utils/shikimori-api';
import type {AnimeCollection} from '/@/components/AnimeCollection/AnimeCollectionDB';
import HorizontalScroller from '/@/components/HorizontalScroller.vue';
import CustomListSingleCard from '/@/components/AnimeCollection/AnimeCollectionSingleCard.vue';
import AnimeCollectionEdit from '/@/components/AnimeCollection/AnimeCollectionEditor.vue';
import {deleteCollection as deleteCollectionFromDB, putCollection} from '/@/components/AnimeCollection/AnimeCollectionDB';



export default defineComponent({
  name: 'AnimeCollection',
  components: {AnimeCollectionEdit, CustomListSingleCard, HorizontalScroller},
  props: {
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
  },

  emits: {
    deleted: null,
  },

  setup(props, {emit}) {
    const localTitle = ref(props.title);
    const localSearchParams = ref(props.requestParams);
    const isEditorOpened = ref(false);

    const animes = ref<(Anime | null)[]>(Array(Number(props.requestParams.limit)).fill(null));
    const errorText = ref('');
    const isLoading = ref(true);

    const searchAnimes = (params: AnimeCollection['requestParams']) => {
      isLoading.value = true;
      const paramsNormalized = new URLSearchParams({
        ...params,
        limit: params.limit + '',// Convert to string for TS
        censored: 'false',
      });
      return apiFetch<Anime[]>(`animes?${paramsNormalized}`)
        .then(_animes => animes.value = _animes)
        .catch(e => {
          animes.value = [];
          errorText.value = typeof e === 'string' ? e : e instanceof Error ? e.toString() : JSON.stringify(e);
        })
        .finally(() => isLoading.value = false);
    };


    searchAnimes(props.requestParams);

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
      searchAnimes(newCollection.requestParams);
    };

    const deleteCollection = () => {
      isEditorOpened.value = false;
      deleteCollectionFromDB(props.id).then(() => emit('deleted', props.id));
    };

    return {
      localTitle,
      localSearchParams,
      animes,
      errorText,
      isLoading,
      updateCollection,
      deleteCollection,
      isEditorOpened,
    };
  },
});
</script>

<style scoped>
.skeleton {
  background-color: #efefef;
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
