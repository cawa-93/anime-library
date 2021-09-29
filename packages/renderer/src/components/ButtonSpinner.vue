<template>
  <div role="status">
    <span class="sr-only">Loading...</span>
  </div>
</template>

<style scoped>
div {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  vertical-align: -.125em;
  border: .15em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: .75s linear infinite spinner-border;
}

@keyframes spinner-border {
  to {
    transform:rotate(360deg)
  }
}
</style>
