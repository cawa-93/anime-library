<template>
  <router-link
    draggable="false"
    class="btn-title-bar win-icon"
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
