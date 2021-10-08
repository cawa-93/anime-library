<script lang="ts" setup>
import {useStorage} from '@vueuse/core';
import {KEY} from '/@/pages/Options/OptionsAnimeTitleLang/OptionsAnimeTitleLangController';


const lang = useStorage(KEY, 'ru');
</script>

<template>
  <form>
    <p>
      Выберите на каком языке отображать названия аниме:
    </p>
    <label class="block mt-3">
      <input
        v-model="lang"
        type="radio"
        name="OptionsAnimeTitleLang"
        value="ru"
      > Русский
    </label>
    <p class="text-sm opacity-60 ml-4">
      Примеры: Легенда о героях Галактики, Атака титанов, Невероятное приключение ДжоДжо.
    </p>

    <label class="block mt-3">
      <input
        v-model="lang"
        type="radio"
        name="OptionsAnimeTitleLang"
        value="romaji"
      > Ромадзи <small class="opacity-80">(Оригинальные названия латиницей)</small>
    </label>
    <p class="text-sm opacity-60 ml-4">
      Примеры: Ginga Eiyuu Densetsu, Shingeki no Kyojin, JoJo no Kimyou na Bouken.
    </p>
  </form>
</template>
