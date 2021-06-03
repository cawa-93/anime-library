<template>
  <div class="p-3 container-fluid">
    <home-search />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useTitle} from '@vueuse/core';
import HomeSearch from '/@/components/HomeSearch.vue';


export default defineComponent({
  name: 'Home',
  components: {HomeSearch},
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
