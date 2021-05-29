<template>
  <div>
    <template
      v-for="group of groups"
      :key="group.title"
    >
      <h4 class="mt-3 px-3">
        {{ group.title }}
      </h4>
      <play-list
        class="my-3"
        :aria-label="group.title"
        :items="group.playListItems"
        :selected-item="selectedTranslation"
      />
    </template>
  </div>
</template>

<script lang="ts">
import type {DeepReadonly, PropType} from 'vue';
import {computed, defineComponent, toRaw} from 'vue';
import {useRoute} from 'vue-router';
import type {Translation} from '/@/utils/videoProvider';
import {useBrowserLocation} from '@vueuse/core';
import {savePreferredTranslation} from '/@/utils/translationRecomendations';
import {formatList} from '/@/utils/formatList';
import type {PlayListItem} from '/@/components/WatchPage/PlayList.vue';
import PlayList from '/@/components/WatchPage/PlayList.vue';


export default defineComponent({
  name: 'TranslationsList',
  components: {PlayList},
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

    const currentLocation = useBrowserLocation();


    const groups = computed<{title: string, playListItems: PlayListItem[]}[]>(() => {
      const groups = new Map<string, DeepReadonly<Translation>[]>();

      for (const translation of props.translations) {
        const g = groups.get(translation.type) || [];
        g.push(translation);

        groups.set(translation.type, g);
      }

      const translationToPlayListItem = (t: DeepReadonly<Translation>): PlayListItem  => ({
        id: typeof t.id === 'number' ? t.id : Number.parseInt(t.id, 10),
        label: t.title,
        title: formatList(t.author.members),
        url: {params: {translationId: t.id, episodeNum: props.selectedEpisodeNum}, hash: currentLocation.value.hash},
      });

      const result = [];
      {
        let translations = groups.get('voice');
        if (translations) {
          result.push({title: 'Озвучка', playListItems: translations.map(translationToPlayListItem)});
        }
      }

      {
        let translations = groups.get('sub');
        if (translations) {
          result.push({title: 'Субтитры', playListItems: translations.map(translationToPlayListItem)});
        }
      }

      return result;
    });



    // Сохранение выбранного перевода в предпочтениях
    const saveToPreferred = (translation: DeepReadonly<Translation>) => {
      savePreferredTranslation(route.params.seriesId as NumberLike, toRaw(translation) as Translation);
    };


    return {selectedTranslation, groups, currentLocation, saveToPreferred, formatList: formatList};
  },
});
</script>
