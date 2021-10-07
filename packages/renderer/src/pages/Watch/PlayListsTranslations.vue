<script lang="ts" setup>
import type {PropType} from 'vue';
import {computed} from 'vue';
import type {Translation} from '/@/utils/videoProvider';
import {formatList} from '/@/utils/formatList';
import type {PlayListItem} from '/@/pages/Watch/PlayListsBaseList.vue';
import PlayListsBaseList from '/@/pages/Watch/PlayListsBaseList.vue';
import {savePreferredTranslation} from '/@/utils/translationRecommendations/savePreferredTranslation';


interface TranslationPlayListItem extends PlayListItem {
  translation: Translation;
}


const props = defineProps({
  seriesId: {
    type: Number,
    required: false,
    default: 0,
  },
  translations: {
    type: Array as PropType<Translation[]>,
    required: true,
  },
  selectedTranslation: {
    required: false,
    type: Object as PropType<Translation>,
    default: () => ({}),
  },
});

const emit = defineEmits({
  'update:selectedTranslation': null,
});


const groups = computed<{ title: string, playListItems: PlayListItem[] }[]>(() => {
  const groups = new Map<string, Translation[]>();

  for (const translation of props.translations) {
    const g = groups.get(translation.type) || [];
    g.push(translation);

    groups.set(translation.type, g);
  }

  const translationToPlayListItem = (t: Translation): TranslationPlayListItem => {

    let badges: PlayListItem['badges'] = [];

    /**
     * Бейдж Украинского языка
     */
    if (navigator.language === 'uk' && (/^укр/i.test(t.title) || /^ua/i.test(t.title) || /^uk/i.test(t.title))) {
      badges.push({
        class: 'light',
        text: '🇺🇦',
      });
    }

    /**
     * Бейдж качества видео
     */
    if (t.qualityType !== 'tv') {
      badges.push({
        class: 'bg-green-500 dark:bg-green-600',
        text: t.qualityType.toLocaleUpperCase(),
      });
    }

    /**
     * Бейдж "Без цензуры"
     */
    if (!t.censored) {
      badges.push({
        class: 'bg-red-500 dark:bg-red-600',
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
  emit('update:selectedTranslation', targetTranslation);

  if (props.seriesId !== 0) {
    savePreferredTranslation(props.seriesId, targetTranslation);
  } else {
    console.warn('Невозможно сохранить выбранный перевод как предпочитаемый', {seriesId: props.seriesId});
  }
};
</script>

<template>
  <div>
    <template
      v-for="group of groups"
      :key="group.title"
    >
      <h4 class="mt-3 px-3">
        {{ group.title }}
      </h4>
      <play-lists-base-list
        class="my-3"
        :aria-label="group.title"
        :items="group.playListItems"
        :selected-item-id="selectedTranslation.id"
        @item-click="onManualSelect"
      />
    </template>
  </div>
</template>
