<script setup lang="ts">
import type {PropType} from 'vue';
import type {Episode, Translation} from '/@/utils/videoProvider';
import SidePanel from '/@/components/SidePanel.vue';
import TabsSection from '/@/components/TabsSection.vue';
import PlayListsEpisodes from '/@/pages/Watch/PlayListsEpisodes.vue';
import PlayListsTranslations from '/@/pages/Watch/PlayListsTranslations.vue';


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
    <tabs-section default-active-slot="translations">
      <template #tab-header="{tabName, isActive, activate}">
        <input
          :id="`${tabName}-tab-header`"
          value="episodes"
          type="radio"
          class="btn-check"
          name="active-tab"
          autocomplete="off"
          :checked="isActive"
          @input="activate"
        >
        <label
          class="btn rounded-0"
          :for="`${tabName}-tab-header`"
        >
          <span
            class="border-initial px-2 pb-2"
            :class="{'border-bottom': isActive}"
          >
            {{ tabName === 'episodes' ? 'Эпизоды' : tabName === 'translations' ? 'Переводы' : tabName }}
          </span>
        </label>
      </template>
      <template
        v-if="episodes.length > 1"
        #episodes
      >
        <play-lists-episodes
          :selected-episode="selectedEpisode"
          :series-id="seriesId"
          :episodes="episodes"
          @update:selectedEpisode="v => $emit('update:selectedEpisode', v)"
        />
      </template>

      <template
        v-if="translations.length && selectedEpisode !== undefined"
        #translations
      >
        <play-lists-translations
          :selected-translation="selectedTranslation"
          :series-id="seriesId"
          :translations="translations"
          @update:selectedTranslation="v => $emit('update:selectedTranslation', v)"
        />
      </template>
    </tabs-section>
  </side-panel>
</template>

<style scoped>
.border-initial {
  border-color: initial;
}
</style>
