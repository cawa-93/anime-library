<template>
  <div>
    <template v-if="isLoading">
      <div
        v-for="i of 5"
        :key="i"
        class="card bg-gradient skeleton"

        style="aspect-ratio: 	97/145"
      />
    </template>
    <template v-else-if="searchResult.length">
      <custom-list-single-card
        v-for="anime of searchResult"
        :key="anime.id"
        :anime="anime"
      />
    </template>
    <p
      v-else
      class="lead"
      :class="{
        'text-danger': errorText
      }"
    >
      {{ errorText ? errorText : 'Ничего не найдено' }}
    </p>
  </div>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {defineComponent, ref, watch} from 'vue';
import type {CustomList} from '/@/components/CustomLists/CustomListsDB';
import {apiFetch} from '/@/utils/shikimori-api';
import type {Anime} from '/@/components/CustomLists/Anime';
import CustomListSingleCard from '/@/components/CustomLists/CustomListSingleCard.vue';


export default defineComponent({
  name: 'CustomListSingle',
  components: {CustomListSingleCard},
  props: {
    requestParams: {
      type: Object as PropType<CustomList['requestParams']>,
      required: true,
    },
  },
  setup(props) {
    const isLoading = ref(true);
    const searchResult = ref<Anime[]>([]);
    const errorText = ref('');

    const searchAnimes = () => {
      isLoading.value = true;
      const searchParams = new URLSearchParams({
        ...props.requestParams,
        limit: String(props.requestParams.limit),
        censored: 'false',
      });
      return apiFetch<Anime[]>(`animes?${searchParams.toString()}`).then(data => {
        searchResult.value = data;
      })
        .catch(e => errorText.value = typeof e === 'string' ? e : e instanceof Error ? e.toString() : JSON.stringify(e))
        .finally(() => isLoading.value = false);
    };

    searchAnimes();

    watch(() => props.requestParams, searchAnimes);

    return {isLoading, searchResult, errorText};
  },
});
</script>

<style scoped>
.skeleton {
  background-color: #efefef;
  cursor: wait;
}
</style>
