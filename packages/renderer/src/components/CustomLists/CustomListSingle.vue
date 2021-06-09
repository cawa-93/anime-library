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
      <router-link
        v-for="anime of searchResult"
        :key="anime.id"
        :to="{
          name: 'Watch',
          params: {seriesId: anime.id}
        }"
        class="card position-relative overflow-hidden"
      >
        <div
          class="anime-status-indicator"
          :class="{
            'bg-primary': anime.status === 'ongoing',
            'bg-success': anime.status === 'released',
          }"
        />
        <img
          class="h-100 w-auto"
          :src="anime.image.original ? 'https://shikimori.one' + anime.image.original : `https://fakeimg.pl/250x400/282828/eae0d0/?text=${anime.name.replaceAll(' ', '%0A')}`"
          alt="Постер"
        >
        <div class="overlay h-100 w-100">
          <section
            class="card-header text-white"
            :class="{
              'bg-primary': anime.status === 'ongoing',
              'bg-success': anime.status === 'released',
            }"
          >
            {{ anime.russian || anime.name }}
          </section>
          <section>
            <ul class="list-group list-group-flush">
              <li
                class="list-group-item anime-status d-flex gap-1"
                :class="anime.status"
              >
                {{ anime.status === 'ongoing' ? 'Выходит' : anime.status === 'released' ? 'Вышло' : 'Анонс' }}
              </li>
              <li
                class="list-group-item"
              >
                {{
                  anime.kind === 'tv' ? 'TV Сериал' : anime.kind === 'movie' ? 'Фильм' : anime.kind === 'special' ? 'Спешл' : anime.kind.toUpperCase()
                }}
              </li>
              <li
                v-if="anime.status === 'ongoing'"
                class="list-group-item"
              >
                Эпизоды: {{ anime.episodes_aired }} / {{ anime.episodes ? anime.episodes : '?' }}
              </li>
              <li
                v-if="anime.status === 'released' && anime.kind !== 'movie'"
                class="list-group-item"
              >
                Эпизодов: {{ anime.episodes ? anime.episodes : '?' }}
              </li>
              <li class="list-group-item">
                Оценка: {{ anime.score }}
              </li>
            </ul>
            <br>
          </section>
        </div>
      </router-link>
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


interface Anime {
  id: number,
  name: string
  russian?: string
  image: {
    original: string
    preview: string
  },
  status: 'anons' | 'ongoing' | 'released',
  episodes: number
  episodes_aired: number
  score: string
  kind: 'tv' | 'movie' | 'ova' | 'ona' | 'special'
}


export default defineComponent({
  name: 'CustomListSingle',
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
.card .overlay {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  background-color: white;
  transition: opacity 200ms;
}

.card:hover .overlay {
  opacity: 1;
}


.skeleton {
  background-color: #efefef;
  cursor: wait;
}

.anime-status-indicator {
  height: 0.5rem;
}

.card img {
  min-height: 0;
}

.anime-status:before {
  content: "";
  display: inline-block;
  width: 7px;
  height: 7px;
  background: red;
  align-self: center;
  border-radius: 50%;
}

.anime-status.released:before {
  background-color: var(--bs-success);
}
.anime-status.ongoing:before {
  background-color: var(--bs-primary);
}
.anime-status.anons:before {
  background-color: var(--bs-danger);
}
</style>
