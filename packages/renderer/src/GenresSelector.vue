<template>
  <section v-if="genres !== undefined">
    <button-switcher
      v-for="genre of genres"
      :key="genre.id"
      class="genre alert m-0"
      :class="{
        'alert-danger text-decoration-line-through': selectedGenres.get(genre.id) === 'exclude',
        'alert-success': selectedGenres.get(genre.id) === 'include',
        'alert-secondary': selectedGenres.get(genre.id) === undefined,
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

<script lang="ts">
import type {PropType} from 'vue';
import {defineComponent, ref} from 'vue';
import type {Genre} from '/@/utils/shikimori-api';
import {getGenres} from '/@/utils/shikimori-api';
import ButtonSwitcher from '/@/components/ButtonSwitcher.vue';


export default defineComponent({
  name: 'GenresSelector',
  components: {ButtonSwitcher},
  props: {
    modelValue: {
      type: Array as PropType<[number, 'include' | 'exclude'][]>,
      required: false,
      default: () => ([]),
    },
  },
  emits: ['update:modelValue'],
  setup(props, {emit}) {
    const genres = ref<Genre[]>();
    getGenres().then(g => genres.value = g.sort((a, b) => {
      const name1 = a.russian || a.name || a.id;
      const name2 = b.russian || b.name || b.id;
      return name1 < name2 ? -1 : name1 > name2 ? 1 : 0;
    }));
    const selectedGenres = ref(new Map(props.modelValue));

    const update = (id: number, state: '' | 'include' | 'exclude') => {
      if (state === '') {
        selectedGenres.value.delete(id);
      } else {
        selectedGenres.value.set(id, state);
      }

      emit('update:modelValue', [...selectedGenres.value.entries()]);
    };

    return {genres, selectedGenres, update};
  },
});
</script>

<style scoped>
section {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.genre {
  padding: 0.3rem 0.7rem;
  border-width: 2px;
  flex-grow: 1;
  text-align: center;
}

.genre:not(:hover) {
  border-color: transparent;
}
</style>
