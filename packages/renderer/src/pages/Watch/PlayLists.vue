<script lang="ts" setup>
import type {PropType} from 'vue';
import type {Episode, Translation} from '/@/utils/videoProvider';
import SidePanel from '/@/components/SidePanel.vue';
import PlayListsEpisodes from '/@/pages/Watch/PlayListsEpisodes.vue';
import PlayListsTranslations from '/@/pages/Watch/PlayListsTranslations.vue';
import {
  Tab as Tab,
  TabGroup as TabGroup,
  TabList as TabList,
  TabPanel as TabPanel,
  TabPanels as TabPanels,
} from '@headlessui/vue';


defineProps({
  seriesId: {
    type: Number,
    required: true,
  },
  episodes: {
    type: Array as PropType<Episode[]>,
    required: true,
  },
  selectedEpisode: {
    type: Object as PropType<Episode | undefined>,
    required: true,
  },
  translations: {
    type: Array as PropType<Translation[]>,
    required: true,
  },
  selectedTranslation: {
    type: Object as PropType<Translation | undefined>,
    required: true,
  },
  isOpened: {
    type: Boolean,
    required: true,
  },
});

defineEmits({
  'update:selectedEpisode': null,
  'update:selectedTranslation': null,
  'update:is-opened': null,
});
</script>

<template>
  <side-panel
    v-if="isOpened"
    :is-opened="isOpened"
    @update:is-opened="v => $emit('update:is-opened', v)"
  >
    <TabGroup :default-index="1">
      <TabList class="flex">
        <Tab
          v-slot="{ selected }"
          :disabled="episodes.length <= 1"
          as="template"
        >
          <button
            class="btn flex-grow rounded-none border-current"
            :class="{
              'border-b-1 ': selected
            }"
          >
            Эпизоды
          </button>
        </Tab>
        <Tab
          v-slot="{ selected }"
          :disabled="translations.length === 0"
          as="template"
        >
          <button
            class="btn flex-grow rounded-none border-current"
            :class="{
              'border-b-1 ': selected
            }"
          >
            Переводы
          </button>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <play-lists-episodes
            :selected-episode="selectedEpisode"
            :series-id="seriesId"
            :episodes="episodes"
            @update:selectedEpisode="v => $emit('update:selectedEpisode', v)"
          />
        </TabPanel>
        <TabPanel>
          <play-lists-translations
            :selected-translation="selectedTranslation"
            :series-id="seriesId"
            :translations="translations"
            @update:selectedTranslation="v => $emit('update:selectedTranslation', v)"
          />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </side-panel>
</template>
