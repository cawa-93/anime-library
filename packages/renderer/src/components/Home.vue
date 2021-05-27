<template>
  <div class="p-3 container-fluid">
    <main-search />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useTitle} from '@vueuse/core';
import MainSearch from '/@/components/MainSearch.vue';


export default defineComponent({
  name: 'Home',
  components: {MainSearch},
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
