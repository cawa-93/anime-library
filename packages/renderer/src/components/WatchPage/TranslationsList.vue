<template>
  <ul>
    <li
      v-for="translation of translations"
      :key="translation.id"
    >
      <router-link
        replace
        :to="{params: {translationId: translation.id}}"
      >
        <strong v-if="selectedTranslation === translation">{{ translation.title }}</strong>
        <span v-else>{{ translation.title }}</span>
      </router-link>
    </li>
  </ul>
</template>

<script lang="ts">
import type { PropType} from 'vue';
import {computed, defineComponent} from 'vue';
import {useRoute} from 'vue-router';
import type {Translation} from '/@/utils/anime';

export default defineComponent({
  name: 'TranslationsList',
  props: {
    translations: {
      type: Array as PropType<Translation[]>,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const selectedTranslation = computed(() => props.translations.find(e => String(e.id) === route.params.translationId) || props.translations[0]);
    return {selectedTranslation};
  },
});
</script>

<style scoped>

</style>
