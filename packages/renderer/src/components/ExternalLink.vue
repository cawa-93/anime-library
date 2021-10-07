<script lang="ts" setup>
import {useElectron} from '/@/use/electron';

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

const {openURL} = useElectron();

</script>

<template>
  <a
    :href="href"
    :title="title"
    target="_blank"
    @click.prevent="openURL(href)"
  ><slot /></a>
</template>
