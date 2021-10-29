<script lang="ts" setup>
import {openExternalURL} from '/@/use/openExternalURL';
import {trackEvent} from '/@/utils/telemetry';


const props = defineProps({
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

const trackAndOpenURL = () => {
  trackEvent('social', 'open_external_url', props.href);
  openExternalURL(props.href);
};

</script>

<template>
  <a
    :href="href"
    :title="title"
    target="_blank"
    @click.prevent="trackAndOpenURL"
  ><slot /></a>
</template>
