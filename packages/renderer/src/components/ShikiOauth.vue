<template>
  <p>
    <button @click="login">
      Авторизоваться
    </button>
    Вы вошли как {{ userName }}
  </p>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {useElectron} from '/@/use/electron';
import * as shiki from '/@/utils/shikimori-api';
import {showErrorMessage} from '/@/utils/dialogs';
import {useRouter} from 'vue-router';


export default defineComponent({
  name: 'ShikiOauth',
  setup() {
    const {openURL} = useElectron();
    const login = () => openURL(shiki.getAuthUrl());

    const userName = ref('');

    const updateName = async () => {
      const data = await shiki.apiFetch<{ nickname: string } | null>('users/whoami');
      if (data) {
        userName.value = data.nickname;
      }
    };

    const code = new URL(location.href).searchParams.get('code') || '';
    if (code) {
      const router = useRouter();
      router.replace({query: {}});
      shiki.refreshCredentials({type: 'authorization_code', code})
        .then(() => {
          updateName();
        })
        .catch(e => {
          showErrorMessage({
            title: 'Ошибка авторизации в Shikimori',
            message: typeof e === 'string'
              ? e
              : e.error_description || e.message
                ? e.error_description || e.message
                : JSON.stringify(e),
          });
          console.error(e);
        });
    } else {
      updateName();
    }


    return {login, userName};
  },
});
</script>

<style scoped>

</style>
