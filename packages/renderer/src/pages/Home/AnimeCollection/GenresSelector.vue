<script lang="ts" setup>
import type {PropType} from 'vue';
import {ref} from 'vue';
import type {Genre} from '/@/utils/shikimori-api';
import shikimoriAnimeGenres from '/@/utils/shikimori-genres.json';
import ButtonSwitcher from '/@/components/ButtonSwitcher.vue';


const genres: Genre[] = (shikimoriAnimeGenres as Genre[]).sort((a, b) => {
  const name1 = a.name || a.id;
  const name2 = b.name || b.id;
  return name1 < name2 ? -1 : name1 > name2 ? 1 : 0;
});

const props = defineProps({
  modelValue: {
    type: Array as PropType<[number, 'include' | 'exclude'][]>,
    required: false,
    default: () => ([]),
  },
});

const emit = defineEmits({
  'update:modelValue': null,
});

const selectedGenres = ref(new Map(props.modelValue));

const update = (id: number, state: '' | 'include' | 'exclude') => {
  if (state === '') {
    selectedGenres.value.delete(id);
  } else {
    selectedGenres.value.set(id, state);
  }

  emit('update:modelValue', [...selectedGenres.value.entries()]);
};
</script>

<template>
  <section
    v-if="genres !== undefined"
    class="flex flex-wrap gap-2"
  >
    <button-switcher
      v-for="genre of genres"
      :key="genre.id"
      class="py-1 px-2 flex-grow text-center btn transition-colors"
      :class="{
        'bg-true-gray-200 hover:bg-true-gray-300 active:(bg-black bg-opacity-70) active:hover:(bg-black bg-opacity-80) dark:(bg-true-gray-900 hover:bg-true-gray-700 active:bg-white active:bg-opacity-70 active:hover:bg-white active:hover:bg-opacity-80)': !selectedGenres.has(genre.id),
        'line-through bg-red-200 text-red-800 hover:bg-red-300 active:(bg-red-900 text-red-100) dark:(bg-red-800 hover:bg-red-700 text-red-200 active:bg-red-200 active:text-red-800)': selectedGenres.get(genre.id) === 'exclude',
        'bg-green-200 hover:bg-green-300 text-green-800 active:(bg-green-900 text-green-100) dark:(bg-green-800 hover:bg-green-700 text-green-200 active:bg-green-200 active:text-green-800)': selectedGenres.get(genre.id) === 'include',
      }"
      :states="['', 'include', 'exclude']"
      :model-value="selectedGenres.get(genre.id) || ''"
      :group-name="genre.id + genre.name"
      :aria-label="genre.name"
      @update:model-value="state => update(genre.id, state)"
    >
      {{ genre.name }}
    </button-switcher>
  </section>
</template>

<style scoped>
/*section {*/
/*  display: flex;*/
/*  flex-wrap: wrap;*/
/*  gap: 0.5em;*/
/*}*/

/*.genre {*/
/*  padding: 0.3rem 0.7rem;*/
/*  flex-grow: 1;*/
/*  text-align: center;*/
/*  background-color: var(--genre-bg, #e8e8e8);*/
/*  color: var(--genre-color);*/
/*  border-radius: .25rem;*/
/*}*/

/*.genre:hover {*/
/*  box-shadow: 0 0 0 1px var(--genre-color, var(--body-color)) inset;*/
/*}*/


/*.genre.exclude {*/
/*  --genre-bg: #f8d7da;*/
/*  --genre-color: #842029;*/
/*}*/

/*.genre.include {*/
/*  --genre-bg: #d1e7dd;*/
/*  --genre-color: #0f5132;*/
/*}*/

/*@media (prefers-color-scheme: dark) {*/
/*  .genre {*/
/*    --genre-bg: var(--input-bg);*/
/*    --genre-color: var(--body-color);*/
/*  }*/

/*  .genre.exclude {*/
/*    --genre-color: #f8d7da;*/
/*    --genre-bg: #842029;*/
/*  }*/

/*  .genre.include {*/
/*    --genre-color: #d1e7dd;*/
/*    --genre-bg: #0f5132;*/
/*  }*/
/*}*/


</style>
