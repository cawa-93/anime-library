<template>
  <router-link
    draggable="false"
    class="btn-title-bar win-icon"
    :to="{name: 'Home'}"
    title="На главную"
    aria-label="На главную"
  >
    &#xE80F;
  </router-link>
</template>

<style scoped>
@import "./btn-titlebar.css";
</style>
