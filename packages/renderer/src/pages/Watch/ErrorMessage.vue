<script lang="ts" setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
});

const reloadPage = () => location.reload();

</script>

<template>
  <p class="text-danger position-absolute text-center w-100 fw-bold lead m-0 py-2">
    {{ message }}
    <br>
    <button
      class="btn btn-link"
      @click="reloadPage"
    >
      Повторить попытку
    </button>
  </p>
</template>

<style scoped>
p {
  top: 50%;
  transform: translateY(-50%);
  background: #000;
}
</style>
