<template>
  <template
    v-for="{data, id} of customLists"
    :key="id"
  >
    <div class="px-3 mt-4 d-flex align-items-center">
      <h2 class="flex-fill">
        {{ data.title }}
      </h2>

      <button
        type="button"
        class="btn btn-lg win-icon edit-custom-list"
        title="Изменить список"
        @click="customListForEdit = id"
      >
        &#xE713;
      </button>
    </div>

    <custom-lists-add
      v-if="customListForEdit === id"
      v-bind="data"
      @save="newList => saveNewList(newList, id)"
      @close="customListForEdit = null"
      @delete="deleteList(id)"
    />
    <section
      :aria-label="data.title"
      class="custom-list-wrapper d-flex gap-2"
      style="height: 300px"
    >
      <!--        class="d-flex gap-2 custom-list h-100"-->
      <custom-list-single
        :request-params="data.requestParams"
      />
    </section>
  </template>

  <p class="my-5 text-center">
    <button
      class="btn btn-lg btn-outline-info"
      @click="customListForEdit = 0"
    >
      Создать новый список
    </button>
  </p>

  <custom-lists-add
    v-if="customListForEdit === 0"
    @save="saveNewList"
    @close="customListForEdit = null"
  />
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import CustomListsAdd from '/@/components/CustomLists/CustomListsAdd.vue';
import type {CustomList} from '/@/components/CustomLists/CustomListsDB';
import {deleteCustomList, getAllCustomLists, putCustomList} from '/@/components/CustomLists/CustomListsDB';
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
    const customListForEdit = ref<number | null>(null);

    updateLists();

    const saveNewList = (newList: CustomList, id?: number) => {
      customListForEdit.value = null;
      putCustomList(newList, id).then(updateLists);
    };

    const deleteList = async (id: number) => {
      customListForEdit.value = null;
      await deleteCustomList(id);
      await updateLists();
    };

    return {updateLists, customLists, deleteList, saveNewList, customListForEdit};
  },
});
</script>

<style scoped>
.custom-list-wrapper {
  overflow-x: auto;
  padding: 0 1rem;
  scroll-snap-type: inline mandatory;
  scroll-padding-inline: 3rem;
  scroll-behavior: smooth;
}
.custom-list-wrapper::-webkit-scrollbar {
  display: none;
}

</style>
