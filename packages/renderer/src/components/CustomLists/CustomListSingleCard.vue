<template>
  <router-link
    :to="{
      name: 'Watch',
      params: {seriesId: anime.id}
    }"
    class="h-100 card"
    :aria-label="anime.russian || anime.name"
    @click="openAnime($event, anime)"
    @auxclick="openAnime($event, anime)"
    @mouseenter="isOverlayVisible = true"
    @mouseleave="isOverlayVisible = false"
    @focusin="isOverlayVisible = true"
    @focusout="isOverlayVisible = false"
  >
    <img
      loading="lazy"
      class="h-100 border-5 border border-bottom-0 border-start-0 border-end-0"
      :class="{
        'border-primary': anime.status === 'ongoing',
        'border-success': anime.status === 'released',
        'border-danger': anime.status === 'anons',
      }"
      :src="anime.image.original ? 'https://shikimori.one' + anime.image.original : `https://fakeimg.pl/250x400/282828/eae0d0/?text=${anime.name.replaceAll(' ', '%0A')}`"
      alt="Постер"
    >
    <transition name="fade">
      <div
        v-if="isOverlayVisible"
        class="overlay h-100 w-100"
      >
        <h3
          class="card-header text-white fs-6 fw-normal"
          :class="{
            'bg-primary': anime.status === 'ongoing',
            'bg-success': anime.status === 'released',
          }"
        >
          {{ anime.russian || anime.name }}
        </h3>
        <section>
          <ul class="list-group list-group-flush">
            <li
              class="list-group-item anime-status d-flex gap-1"
              :class="anime.status"
            >
              {{ anime.status === 'ongoing' ? 'Выходит' : anime.status === 'released' ? 'Вышло' : 'Анонс' }}
            </li>
            <li
              v-if="anime.kind"
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
              v-else-if="anime.status === 'released' && anime.kind !== 'movie'"
              class="list-group-item"
            >
              Эпизодов: {{ anime.episodes ? anime.episodes : '?' }}
            </li>
            <li class="list-group-item">
              Оценка: {{ anime.score }}
            </li>
          </ul>
        </section>
      </div>
    </transition>
  </router-link>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {defineComponent, ref} from 'vue';
import type {Anime} from '/@/components/CustomLists/Anime';
import {useElectron} from '/@/use/electron';


export default defineComponent({
  name: 'CustomListSingleCard',
  props: {
    anime: {
      type: Object as PropType<Anime>,
      required: true,
    },
  },
  setup() {
    const {openURL} = useElectron();
    const openAnime = (event: MouseEvent, anime: Anime) => {
      if (event.ctrlKey || event.button === 1) {
        event.preventDefault();
        return openURL('https://shikimori.one' + anime.url);
      }
    };

    const isOverlayVisible = ref(false);

    return {openAnime, isOverlayVisible};
  },
});
</script>

<style scoped>
.anime-status-indicator {
  height: 0.5rem;
}

.card {
  min-width: auto;
  scroll-snap-align: start;
}

.card img {
  min-height: 0;
}


.card .overlay {
  position: absolute;
  top: 0;
  left: 0;
  background-color: white;
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
