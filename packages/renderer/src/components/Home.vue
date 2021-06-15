<template>
  <main>
    <div class="p-3 container-fluid">
      <home-search />
    </div>

    <custom-lists />

    <home-footer class="mt-5 border-top" />
  </main>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useTitle} from '@vueuse/core';
import HomeSearch from '/@/components/HomeSearch.vue';
import CustomLists from '/@/components/CustomLists/CustomLists.vue';
import HomeFooter from '/@/components/HomeFooter.vue';


export default defineComponent({
  name: 'Home',
  components: {HomeFooter, CustomLists, HomeSearch},
  setup() {

    //
    // Заголовок страницы
    useTitle('Галерея аниме');
  },
});
</script>

<style scoped>
label {
  display: block;
}

input:invalid {
  border-color: red;
}

</style>
