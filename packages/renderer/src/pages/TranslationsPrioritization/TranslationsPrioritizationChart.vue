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

  onIncrement: {
    type: Function,
    required: false,
    default: undefined,
  },

  onDecrement: {
    type: Function,
    required: false,
    default: undefined,
  },

  onRemove: {
    type: Function,
    required: false,
    default: undefined,
  },
});

defineEmits({
  increment: null,
  decrement: null,
  remove: null,
});

const allowIncrement = computed(() => typeof props.onIncrement === 'function');
const allowDecrement = computed(() => typeof props.onDecrement === 'function');
const allowRemove = computed(() => typeof props.onRemove === 'function');


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
      type: 'sub',
      stat: typeStat.value.sub,
      authors: authorsSubStat.value,
    });
  }

  if (authorsVoiceStat.value.length) {
    sections.push({
      label: 'Озвучка',
      type: 'voice',
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
      v-for="{label, type, stat, authors} of sections"
      :key="label"
      class="flex-1"
    >
      <h4 class="mb-3">
        {{ label }} {{ stat < 1 ? numToPercent(stat) : '' }}
      </h4>
      <ol class="flex flex-wrap gap-x-4 gap-y-2">
        <li
          v-for="(author, index) of authors"
          :key="author.author"
          class="capitalize rounded overflow-hidden flex items-center border-1"
        >
          <button
            v-if="index > 0 && allowIncrement"
            class="btn win-icon"
            title="Повысить приоритет"
            aria-label="Повысить приоритет"
            @click="$emit('increment', author.author, type)"
          >
            &#xe72b;
          </button>
          <span class="label">{{ author.author }} {{ showPercents ? `(${numToPercent(author.stat)})` : '' }}</span>
          <button
            v-if="index < authors.length - 1 && allowDecrement"
            class="btn win-icon"
            title="Понизить приоритет"
            aria-label="Понизить приоритет"
            @click="$emit('decrement', author.author, type)"
          >
            &#xe72a;
          </button>
          <button
            v-else-if="allowRemove"
            class="btn win-icon"
            title="Забыть автора"
            aria-label="Забыть автора"
            @click="$emit('remove', author.author, type)"
          >
            &#xe74d;
          </button>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
li > * {
  @apply p-1;
}

li:not(:hover) > .win-icon {
  opacity: 0;
}

.label {
  @apply px-2;
}

.label:first-child {
  margin-left: 33px;
}

.label:last-child {
  margin-right: 33px;
}

.btn {
  border-radius: 0;
}

.win-icon {
  @apply first:border-r last:border-l;
  width: 32px;
}
</style>
