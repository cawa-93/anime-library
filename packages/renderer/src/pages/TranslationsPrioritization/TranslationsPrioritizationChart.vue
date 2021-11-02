<script lang="ts" setup>
import type {PropType} from 'vue';
import {computed} from 'vue';
import type {TranslationRecommendationValue} from '/@/utils/translationRecommendations/getDB';
import type {TranslationType} from '/@/utils/videoProvider';
import {numToPercent} from '/@/utils/numToPercent';


const props = defineProps({
  preferences: {
    type: Array as PropType<TranslationRecommendationValue[]>,
    required: true,
  },

  showPercents: {
    type: Boolean,
    required: false,
    default: false,
  },
});


interface TypeStat {
  voice: number,
  sub: number
}


const typeStat = computed<TypeStat>(() => {
  if (!props.preferences.length) {
    return {
      voice: 0,
      sub: 0,
    };
  }

  const voiceCount = props.preferences.filter(t => t.type === 'voice').length;

  return {
    voice: voiceCount / props.preferences.length,
    sub: (props.preferences.length - voiceCount) / props.preferences.length,
  };
});

type AuthorsStat = { author: string, stat: number }


const authorsStatByType = (targetType: TranslationType) => (): AuthorsStat[] => {
  if (!props.preferences.length) {
    return [];
  }

  const typedTranslations = props.preferences.filter(t => t.type === targetType);

  if (!typedTranslations.length) {
    return [];
  }

  const allAuthors = typedTranslations.flatMap(t => t.author);

  const map = allAuthors.reduce((map, author) => {
    map.set(author, (map.get(author) || 0) + 1);
    return map;
  }, new Map<string, number>());

  return Array.from(map)
    .map(([author, count]) => ({author, stat: count / allAuthors.length}))
    .sort((t1, t2) => t2.stat - t1.stat);
};


const authorsVoiceStat = computed(authorsStatByType('voice'));
const authorsSubStat = computed(authorsStatByType('sub'));

const sections = computed(() => {
  const sections = [];

  if (authorsSubStat.value.length) {
    sections.push({
      label: 'Субтитры',
      stat: typeStat.value.sub,
      authors: authorsSubStat.value,
    });
  }

  if (authorsVoiceStat.value.length) {
    sections.push({
      label: 'Озвучка',
      stat: typeStat.value.voice,
      authors: authorsVoiceStat.value,
    });
  }

  return sections.sort((s1, s2) => s2.stat - s1.stat);
});
</script>

<template>
  <div class="flex">
    <section
      v-for="{label, stat, authors} of sections"
      :key="label"
      class="flex-1"
    >
      <h4>{{ label }} {{ stat < 1 ? numToPercent(stat) : '' }}</h4>
      <ol class="flex flex-wrap gap-2">
        <li
          v-for="author of authors"
          :key="author.author"
          class=" capitalize"
        >
          {{ author.author }} {{ showPercents ? `(${numToPercent(author.stat)})` : '' }}
        </li>
      </ol>
    </section>
  </div>
</template>
