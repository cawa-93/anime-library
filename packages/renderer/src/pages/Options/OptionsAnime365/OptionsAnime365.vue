<script lang="ts" setup>
import {TabList as TabList, TabGroup as TabGroup, Tab as Tab, TabPanel as TabPanel, TabPanels as TabPanels} from '@headlessui/vue';
import OptionsAnime365Status from '/@/pages/Options/OptionsAnime365/OptionsAnime365Status.vue';
import OptionsAnime365Token from '/@/pages/Options/OptionsAnime365/OptionsAnime365Token.vue';
import OptionsAnime365Login from '/@/pages/Options/OptionsAnime365/OptionsAnime365Login.vue';
</script>

<template>
  <TabGroup>
    <TabList class="grid grid-flow-col mb-5">
      <Tab
        v-slot="{ selected }"
        as="template"
      >
        <button
          class="btn"
          :class="{'bg-accent': selected}"
        >
          Статус
        </button>
      </Tab>
      <Tab
        v-slot="{ selected }"
        as="template"
      >
        <button
          class="btn"
          :class="{'bg-accent': selected}"
        >
          Шаг 1
        </button>
      </Tab>
      <Tab
        v-slot="{ selected }"
        as="template"
      >
        <button
          class="btn"
          :class="{'bg-accent': selected}"
        >
          Шаг 2
        </button>
      </Tab>
    </TabList>
    <TabPanels>
      <TabPanel><options-anime365-status /></TabPanel>
      <TabPanel><options-anime365-login /></TabPanel>
      <TabPanel><options-anime365-token /></TabPanel>
    </TabPanels>
  </TabGroup>
</template>

<style scoped>
.btn {
  @apply border-accent border-t border-b border-l last:border-r not-first:rounded-l-none not-last:rounded-r-none;
}
</style>
