<template>
  <template
    v-for="group of groups"
    :key="group.title"
  >
    <h3>{{ group.title }}</h3>
    <ul
      :aria-label="group.title"
      class="playlist"
    >
      <li
        v-for="translation of group.translations"
        :key="translation.id"
      >
        <router-link
          :class="{active: selectedTranslation === translation}"
          :to="{params: {translationId: translation.id, episodeNum: selectedEpisodeNum}}"
          replace
        >
          <win-icon class="play-icon">
            &#xF5B0;
          </win-icon>
          {{ translation.title || 'Неизвестный' }}
        </router-link>
      </li>
    </ul>
  </template>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {computed, defineComponent} from 'vue';
import {useRoute} from 'vue-router';
import type {Translation} from '/@/utils/anime';
import WinIcon from '/@/components/WinIcon.vue';

export default defineComponent({
  name: 'TranslationsList',
  components: {WinIcon},
  props: {
    translations: {
      type: Array as PropType<Translation[]>,
      required: true,
    },
    selectedEpisodeNum: {
      required: true,
      type: [String, Number] as PropType<NumberLike>,
    },
  },
  setup(props) {
    const route = useRoute();
    const selectedTranslation = computed(() => props.translations.find(e => String(e.id) === route.params.translationId) || props.translations[0]);

    const groups = computed(() => {
      const groups = new Map<string, Translation[]>();

      for (const translation of props.translations) {
        const g = groups.get(translation.type) || [];
        g.push(translation);

        groups.set(translation.type, g);
      }

      const result = [];
      {
        let translations = groups.get('voice');
        if (translations) {
          result.push({title: 'Озвучка', translations});
        }
      }

      {
        let translations = groups.get('sub');
        if (translations) {
          result.push({title: 'Субтитры', translations});
        }
      }

      return result;
    });

    return {selectedTranslation, groups};
  },
});
</script>

<style scoped>
@import "playlist.css";
</style>
