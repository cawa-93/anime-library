<template>
  <small class="d-inline-block text-truncate">{{ title }}</small>
</template>

<script lang="ts" setup>
import {useTitle} from '@vueuse/core';


const title = useTitle(undefined, {observe: true});

</script>
