<script lang="ts" setup>
import type {PropType} from 'vue';
import {ref} from 'vue';
import type {Genre} from '/@/utils/shikimori-api';
import shikimoriAnimeGenres from '/@/utils/shikimori-genres.json';
import ButtonSwitcher from '/@/components/ButtonSwitcher.vue';


const genres: Genre[] = (shikimoriAnimeGenres as Genre[]).sort((a, b) => {
  const name1 = a.russian || a.name || a.id;
  const name2 = b.russian || b.name || b.id;
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
  <section v-if="genres !== undefined">
    <button-switcher
      v-for="genre of genres"
      :key="genre.id"
      class="genre m-0"
      :class="{
        'exclude text-decoration-line-through': selectedGenres.get(genre.id) === 'exclude',
        'include': selectedGenres.get(genre.id) === 'include',
      }"
      :states="['', 'include', 'exclude']"
      :model-value="selectedGenres.get(genre.id) || ''"
      :group-name="genre.id + genre.name"
      @update:modelValue="state => update(genre.id, state)"
    >
      {{ genre.russian }}
    </button-switcher>
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.genre {
  padding: 0.3rem 0.7rem;
  flex-grow: 1;
  text-align: center;
  background-color: var(--genre-bg, #e8e8e8);
  color: var(--genre-color);
  border-radius: .25rem;
}

.genre:hover {
  box-shadow: 0 0 0 1px var(--genre-color, var(--body-color)) inset;
}


.genre.exclude {
  --genre-bg: #f8d7da;
  --genre-color: #842029;
}

.genre.include {
  --genre-bg: #d1e7dd;
  --genre-color: #0f5132;
}

@media (prefers-color-scheme: dark) {
  .genre {
    --genre-bg: var(--input-bg);
    --genre-color: var(--body-color);
  }

  .genre.exclude {
    --genre-color: #f8d7da;
    --genre-bg: #842029;
  }

  .genre.include {
    --genre-color: #d1e7dd;
    --genre-bg: #0f5132;
  }
}


</style>
