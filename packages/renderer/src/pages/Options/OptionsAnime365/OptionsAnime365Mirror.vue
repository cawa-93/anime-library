<script lang="ts" setup>
import {ref} from 'vue';


const newDomain = ref(localStorage.getItem('anime365-mirror') || '');

const onSubmitHandler = () => {
  localStorage.setItem('anime365-mirror', newDomain.value);
};
</script>

<template>
  <form @submit.prevent="onSubmitHandler">
    <label for="anime365-domain">Домен:</label>
    <input
      id="anime365-domain"
      v-model="newDomain"
      type="url"
      placeholder="https://"
      list="anime365-domains-list"
    >


    <datalist id="anime365-domains-list">
      <option value="https://smotret-anime.com/" />
      <option value="https://anime365.ru/" />
      <option value="https://smotret-anime.online/" />
    </datalist>

    <button class="btn bg-accent">
      Сохранить
    </button>
  </form>
</template>

<style scoped>
form {
  display: grid;
  grid-auto-columns: 1fr;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 5px 10px;
}
label { grid-area: 1 / 1 / 2 / 3; }
input { grid-area: 2 / 1 / 3 / 2; }
button { grid-area: 2 / 2 / 3 / 3; }
</style>
