<template>
  <div>
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
            :title="formatList(translation.author.members)"
            :class="{active: selectedTranslation === translation}"
            :to="{params: {translationId: translation.id, episodeNum: selectedEpisodeNum}, hash: currentLocation.hash}"
            replace
            @click="saveToPreferred(translation)"
          >
            <win-icon class="play-icon">
              &#xF5B0;
            </win-icon>
            <span class="nowrap">{{ translation.title || 'Неизвестный' }}</span>
          </router-link>
        </li>
      </ul>
    </template>
  </div>
</template>

<script lang="ts">
import type {DeepReadonly, PropType} from 'vue';
import {computed, defineComponent, toRaw} from 'vue';
import {useRoute} from 'vue-router';
import WinIcon from '/@/components/WinIcon.vue';
import type {Translation} from '/@/utils/videoProvider';
import {useBrowserLocation} from '@vueuse/core';
import {savePreferredTranslation} from '/@/utils/translationRecomendations';
import {formatList} from '/@/utils/formatList';


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
      const groups = new Map<string, DeepReadonly<Translation>[]>();

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

    const currentLocation = useBrowserLocation();


    // Сохранение выбранного перевода в предпочтениях
    const saveToPreferred = (translation: DeepReadonly<Translation>) => {
      savePreferredTranslation(route.params.seriesId as NumberLike, toRaw(translation) as Translation);
    };


    return {selectedTranslation, groups, currentLocation, saveToPreferred, formatList: formatList};
  },
});
</script>

<style scoped>
@import "playlist.css";
</style>
