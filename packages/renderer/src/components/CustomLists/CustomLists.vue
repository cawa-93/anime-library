<template>
  <template
    v-for="{data, id} of customLists"
    :key="id"
  >
    <h2 class="px-3 mt-4">
      {{ data.title }}
    </h2>
    <section
      :aria-label="data.title"
      class="custom-list-wrapper px-3"
      style="height: 300px"
    >
      <custom-list-single
        class="d-flex gap-2 custom-list h-100"
        :request-params="data.requestParams"
      />
    </section>
  </template>
  <custom-lists-add @submit="updateLists" />
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import CustomListsAdd from '/@/components/CustomLists/CustomListsAdd.vue';
import type {CustomList} from '/@/components/CustomLists/CustomListsDB';
import {getAllCustomLists} from '/@/components/CustomLists/CustomListsDB';
import CustomListSingle from '/@/components/CustomLists/CustomListSingle.vue';


export default defineComponent({
  name: 'CustomLists',
  components: {CustomListSingle, CustomListsAdd},
  setup() {

    const updateLists = () => getAllCustomLists()
      .then(all => customLists.value = all)
      .finally(() => isLoading.value = false);

    const isLoading = ref(true);
    const customLists = ref<{ data: CustomList, id: number }[]>([]);

    updateLists();

    return {updateLists, customLists};
  },
});
</script>

<style scoped>
.custom-list-wrapper {
  width: 100%;
  overflow-x: auto;
}
.custom-list-wrapper::-webkit-scrollbar {
  display: none;
}

.custom-list {
  width: fit-content;
}

</style>
