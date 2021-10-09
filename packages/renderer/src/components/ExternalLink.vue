<script lang="ts" setup>
import {openExternalURL} from '/@/use/openExternalURL';


defineProps({
  href: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    required: false,
    default: 'Ссылка будет открыта в браузере',
  },
});


</script>

<template>
  <a
    :href="href"
    :title="title"
    target="_blank"
    @click.prevent="openExternalURL(href)"
  ><slot /></a>
</template>
