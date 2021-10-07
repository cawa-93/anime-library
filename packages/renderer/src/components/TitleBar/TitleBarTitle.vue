<template>
  <small class="text-xs flex-1 self-center select-none truncate opacity-70">{{ title }}</small>
</template>

<script lang="ts" setup>
import {useTitle} from '@vueuse/core';

const title = useTitle(undefined, {observe: true});
</script>
