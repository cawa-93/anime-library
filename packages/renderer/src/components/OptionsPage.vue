<template>
  <div class="container p-3">
    <option-anime365 class="mb-3" />
    <shiki-oauth />
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import {useElectron} from '/@/use/electron';
import {onClickOutside, useTitle} from '@vueuse/core';
import {getAccessToken, saveAccessToken} from '/@/utils/videoProvider/providers/anime365';
import ShikiOauth from '/@/components/ShikiOauth.vue';
import OptionAnime365 from '/@/components/OptionAnime365.vue';

export default defineComponent({
  name: 'OptionsPage',
  components: {OptionAnime365, ShikiOauth},
  setup() {
    //
    // Заголовок страницы
    const t = useTitle();
    t.value = 'Параметры';


    const helpDialog = ref<HTMLDialogElement>();
    onClickOutside(helpDialog, () => {
      if (helpDialog.value) {
        helpDialog.value.open = false;
      }
    });

    const openDialog = () => {
      if (helpDialog.value) {
        helpDialog.value.open = true;
      }
    };

    const {openURL} = useElectron();
    const openExternal = (event: MouseEvent) => {
      if (!event.target) {
        return;
      }

      const target = event.target as HTMLAnchorElement;
      if (!target.href) {
        return;
      }

      openURL(target.href);
    };

    const jsonData = ref('');
    const parsedAccessToken = computed(() => {
      try {
        return JSON.parse(jsonData.value).data.access_token;
      } catch {
        return '';
      }
    });

    const SmAccessToken = ref(getAccessToken() || '');
    const saveAccessTokenOption = () => saveAccessToken(SmAccessToken.value);

    return {helpDialog, openExternal, jsonData, parsedAccessToken, saveAccessTokenOption, SmAccessToken, openDialog};
  },
});
</script>

<style scoped>
dialog::backdrop {
  background-color: red;
}

dialog ol {
  padding-inline-end: 40px;
}

dialog textarea, dialog input {
  width: 100%;
}

a.help-text {
  text-decoration: underline dotted gray;
  cursor: help;
}
</style>
