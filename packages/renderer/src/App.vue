<template>
  <app-location />
  <!--  <app-navigation />-->
  <router-view />
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import AppLocation from '/@/components/location.vue';

export default defineComponent({
  name: 'App',
  components: {AppLocation},
});
</script>

