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
        :selected-item-id="currentTranslation.id"
        @item-click="onManualSelect"
      />
    </template>
  </div>
</template>

<script lang="ts">
import type {PropType} from 'vue';
import {computed, defineComponent} from 'vue';
import type {Translation} from '/@/utils/videoProvider';
import {savePreferredTranslation} from '/@/utils/translationRecomendations';
import {formatList} from '/@/utils/formatList';
import type {PlayListItem} from '/@/components/WatchPage/PlayList.vue';
import PlayList from '/@/components/WatchPage/PlayList.vue';


interface TranslationPlayListItem extends PlayListItem {
  translation: Translation
}


export default defineComponent({
  name: 'TranslationsList',
  components: {PlayList},
  props: {
    seriesId: {
      type: Number,
      required: false,
      default: 0,
    },
    translations: {
      type: Array as PropType<Translation[]>,
      required: true,
    },
    currentTranslation: {
      required: false,
      type: Object as PropType<Translation>,
      default: () => ({}),
    },
  },
  emits: ['update:currentTranslation'],
  setup(props, {emit}) {
    const groups = computed<{ title: string, playListItems: PlayListItem[] }[]>(() => {
      const groups = new Map<string, Translation[]>();

      for (const translation of props.translations) {
        const g = groups.get(translation.type) || [];
        g.push(translation);

        groups.set(translation.type, g);
      }

      const translationToPlayListItem = (t: Translation): TranslationPlayListItem => {

        let badges: PlayListItem['badges'] = [];

        if (t.qualityType !== 'tv') {
          badges.push({
            style: 'success',
            text: t.qualityType.toLocaleUpperCase(),
          });
        }

        if (!t.censored) {
          badges.push({
            style: 'danger',
            text: 'CE',
          });
        }

        return {
          id: t.id,
          label: t.title,
          title: formatList(t.author.members),
          badges,
          translation: t,
        };
      };

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
    const onManualSelect = (item: TranslationPlayListItem) => {
      const targetTranslation = item.translation;
      emit('update:currentTranslation', targetTranslation);

      if (props.seriesId !== 0) {
        savePreferredTranslation(props.seriesId, targetTranslation);
      } else {
        console.warn('Невозможно сохранить выбранный перевод как предпочитаемый', {seriesId: props.seriesId});
      }
    };



    return {groups, onManualSelect};
  },
});
</script>
