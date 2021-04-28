<template>
  <form
    @submit.prevent="onSearch"
  >
    <p>
      <label>
        Для отладки<br>
        <input
          type="url"
          readonly
          value="https://shikimori.one/animes/40938-hige-wo-soru-soshite-joshikousei-wo-hirou"
        >
      </label>
    </p>
    <label>
      Ссылка на Шикимори<br>
      <!-- https://shikimori.one/animes/40938-hige-wo-soru-soshite-joshikousei-wo-hirou -->
      <input
        autocomplete="on"
        name="searchText"
        placeholder="https://shikimori.one/animes/..."
        required
        type="url"
      >
    </label>
    <button>Найти</button>
  </form>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {useRouter} from 'vue-router';


export default defineComponent({
  name: 'Home',
  setup() {

    const router = useRouter();

    const animeID = ref<`${number}` | undefined>(undefined);

    /**
     * Вместо `Event` нужно использовать `SubmitEvent`
     * Но `SubmitEvent` не добавлен в TypeScript
     * @see https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1005
     */
    const onSearch = (event: Event) => {
      const {searchText} = Object.fromEntries(new FormData(event.target as HTMLFormElement));
      if (typeof searchText !== 'string') {
        throw new Error('Search value must be a string, but got ' + typeof searchText);
      }
      animeID.value = /\/animes\/(?<animeID>[0-9]+)/.exec(searchText)?.groups?.animeID as `${number}`;

      if (animeID.value) {
        router.push({name: 'Watch', params: {seriesId: animeID.value}});
      }
    };

    return {onSearch};
  },
});
</script>

<style scoped>
label {
  display: block;
}
</style>
