<script lang="ts" setup>
import {computed, ref, watch} from 'vue';
import GenresSelector from '/@/pages/Home/AnimeCollection/GenresSelector.vue';
import {useVModel} from '@vueuse/core';


const props = defineProps({
  title: {
    type: String,
    required: false,
    default: '',
  },

  limit: {
    type: Number,
    required: false,
    default: 0,
  },

  status: {
    type: String,
    required: false,
    default: '',
  },

  kind: {
    type: String,
    required: false,
    default: '',
  },

  order: {
    type: String,
    required: false,
    default: '',
  },

  mylist: {
    type: String,
    required: false,
    default: '',
  },

  genre: {
    type: String,
    required: false,
    default: '',
  },
});

const emit = defineEmits({
  'update:title': null,
  'update:limit': null,
  'update:kind': null,
  'update:status': null,
  'update:order': null,
  'update:mylist': null,
  'update:genre': null,
  // 'submit': null,
});

const statusRef = computed({
  get() {
    return props.status?.split(',')?.filter(s => !!s) || [];
  },
  set(v: string[]) {
    emit('update:status', v.map(s => s.trim()).join(','));
  },
});

const kindRef = computed({
  get() {
    return props.kind?.split(',')?.filter(s => !!s) || [];
  },
  set(v: string[]) {
    emit('update:kind', v.map(s => s.trim()).join(','));
  },
});

const orderRef = useVModel(props, 'order', emit);

const mylistType = ref<'exclude' | 'include'>(
  props.mylist && !props.mylist.startsWith('!')
    ? 'include'
    : 'exclude',
);


const selectedLists = ref(
  props.mylist
    ?.split(',')
    .filter(s => !!s)
    .map(s => s.startsWith('!') ? s.substring(1) : s),
);

watch([mylistType, selectedLists], () => {
  const mylist = selectedLists.value.map(s => `${mylistType.value === 'exclude' ? '!' : ''}${s}`).join(',');
  emit('update:mylist', mylist);
});


const genreRef = computed({
  get() {
    return props.genre
      ? props.genre
        .split(',')
        .filter(s => !!s)
        .map(s => s.startsWith('!')
          ? [Number(s.slice(1)), 'exclude'] as [number, 'exclude']
          : [Number(s), 'include'] as [number, 'include'])
      : [];
  },
  set(v: [number, 'include' | 'exclude'][]) {
    const genre = v.map(([id, type]) => `${type === 'exclude' ? '!' : ''}${id}`).join(',');
    emit('update:genre', genre);
  },
});
</script>

<template>
  <form>
    <label class="list-title">
      Название коллекции:
      <input
        type="text"
        :value="title"
        @input="$emit('update:title', $event.target.value)"
      >
    </label>

    <label class="limit-results">
      Максимум результатов:
      <input
        :value="limit"
        type="number"
        min="1"
        max="50"
        @input="$emit('update:limit', $event.target.valueAsNumber)"
      ></label>

    <fieldset class="kind">
      <legend>Тип</legend>

      <label>
        <input
          v-model="kindRef"
          value="tv"
          type="checkbox"
        >
        TV Сериал
      </label>
      <label>
        <input
          id="movie"
          v-model="kindRef"
          value="movie"
          type="checkbox"
        >
        Фильм
      </label>
      <label>
        <input
          id="ova"
          v-model="kindRef"
          value="ova"
          type="checkbox"
        >
        OVA
      </label>
      <label>
        <input
          id="ona"
          v-model="kindRef"
          value="ona"
          type="checkbox"
        >
        ONA
      </label>
      <label>
        <input
          v-model="kindRef"
          value="special"
          type="checkbox"
        >
        Спешл
      </label>
    </fieldset>
    <fieldset class="status">
      <legend>Статус</legend>

      <label>
        <input
          v-model="statusRef"
          value="ongoing"
          type="checkbox"
        >
        Сейчас выходит
      </label>
      <label>
        <input
          v-model="statusRef"
          value="released"
          type="checkbox"
        >
        Вышедшее
      </label>
      <label>
        <input
          v-model="statusRef"
          value="latest"
          type="checkbox"
        >
        Недавно вышедшие
      </label>
    </fieldset>

    <fieldset class="order">
      <legend>Сортировка</legend>

      <label>
        <input
          v-model="orderRef"
          value="ranked"
          type="radio"
          name="order"
        >
        По рейтингу
      </label>
      <label>
        <input
          v-model="orderRef"

          value="popularity"
          type="radio"
          name="order"
        >
        По популярности
      </label>
      <label>
        <input
          v-model="orderRef"
          value="aired_on"
          type="radio"
          name="order"
        >
        По дате выхода
      </label>
    </fieldset>


    <fieldset class="list">
      <legend>Мой Список Shikimori</legend>

      <label>
        <input
          v-model="mylistType"
          value="exclude"
          type="radio"
          name="my-list-type"
        >
        Исключить всё из списков:
      </label>
      <label class="mb-2">
        <input
          v-model="mylistType"
          value="include"
          type="radio"
          name="my-list-type"
        >
        Включить только из списков:
      </label>

      <label>
        <input
          v-model="selectedLists"
          value="planned"
          type="checkbox"
          name="my-list"
        >
        Запланировано
      </label>

      <label>
        <input
          v-model="selectedLists"
          value="watching"
          type="checkbox"
          name="my-list"
        >
        Смотрю
      </label>

      <label>
        <input
          v-model="selectedLists"
          value="rewatching"
          type="checkbox"
          name="my-list"
        >
        Пересматриваю
      </label>

      <label>
        <input
          v-model="selectedLists"
          value="completed"
          type="checkbox"
          name="my-list"
        >
        Просмотрено
      </label>

      <label>
        <input
          v-model="selectedLists"
          value="on_hold"
          type="checkbox"
          name="my-list"
        >
        Отложено
      </label>
      <label>
        <input
          v-model="selectedLists"
          value="dropped"
          type="checkbox"
          name="my-list"
        >
        Брошено
      </label>
    </fieldset>
    <fieldset class="genres">
      <legend>Жанры</legend>
      <genres-selector v-model="genreRef" />
    </fieldset>
  </form>
</template>


<style scoped>
label {
  @apply block;
}

legend {
  @apply text-xl mb-2
}

form {
  @apply grid gap-5 w-full h-full;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(4, auto) 1fr;
  grid-template-areas:
    "list-title limit-results"
    "kind genres"
    "status genres"
    "order genres"
    "list genres";
}

.list-title {
  grid-area: list-title;
}

.limit-results {
  grid-area: limit-results;
}

.kind {
  grid-area: kind;
}

.status {
  grid-area: status;
}

.order {
  grid-area: order;
}

.list {
  grid-area: list;
}

.genres {
  grid-area: genres;
}
</style>
