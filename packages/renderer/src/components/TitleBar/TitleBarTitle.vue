<template>
  <small class="flex-1 self-center select-none truncate">{{ title }}</small>
</template>

<script lang="ts" setup>
import {useTitle} from '@vueuse/core';

const title = useTitle(undefined, {observe: true});
</script>
