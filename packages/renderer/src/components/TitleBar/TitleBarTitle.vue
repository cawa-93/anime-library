<template>
  <small class="flex-1 self-center">{{ title }}</small>
</template>

<script lang="ts" setup>
import {useTitle} from '@vueuse/core';

const title = useTitle(undefined, {observe: true});
</script>
