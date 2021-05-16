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
          :to="{params: {translationId: translation.id, episodeNum: selectedEpisodeNum}, hash: currentLocation.hash}"
          replace
        >
          <win-icon class="play-icon">
            &#xF5B0;
          </win-icon>
          <span class="nowrap">{{ translation.title || 'Неизвестный' }}</span>
        </router-link>
      </li>
    </ul>
  </template>
</template>

<script lang="ts">
import type {DeepReadonly, PropType} from 'vue';
import {computed, defineComponent} from 'vue';
import {useRoute} from 'vue-router';
import WinIcon from '/@/components/WinIcon.vue';
import type {Translation} from '/@/utils/videoProvider';
import {useBrowserLocation} from '@vueuse/core';

export default defineComponent({
  name: 'TranslationsList',
  components: {WinIcon},
  props: {
    translations: {
      type: Array as PropType<DeepReadonly<Translation[]>>,
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

    // const hash = ref(location.hash);
    const currentLocation = useBrowserLocation();
    // useIntervalFn(() => console.log({native: location.hash, wrapped: l.value.hash}));
    // setTimeout(() => hash.value = location.hash, 1000);

    return {selectedTranslation, groups, currentLocation};
  },
});
</script>

<style scoped>
@import "playlist.css";
</style>
