<template>
  <router-link
    draggable="false"
    class="win-icon btn-title-bar"
    :to="{name: 'Options'}"
    title="Параметры"
    aria-label="Параметры"
  >
    &#xE713;
  </router-link>
</template>

<style scoped>
@import "btn-titlebar.css";
</style>
