<template>
  <form
    @submit.prevent="onSearch"
  >
    <p v-if="!isProd">
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
        pattern=".*/animes/[a-z]*[0-9]+.*"
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
      animeID.value = /\/animes\/[a-z]*(?<animeID>[0-9]+)/.exec(searchText)?.groups?.animeID as `${number}`;

      if (animeID.value) {
        router.push({name: 'Watch', params: {seriesId: animeID.value, episodeNum: '1'}});
      }
    };

    const isProd = import.meta.env.PROD;

    return {onSearch, isProd};
  },
});
</script>

<style scoped>
label {
  display: block;
}

input:invalid {
  border-color: red;
}

</style>
