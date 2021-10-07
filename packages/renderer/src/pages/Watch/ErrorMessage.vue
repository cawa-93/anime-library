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
  <p class="text-red-500 text-center font-medium w-full py-2">
    <span>{{ message }}</span>
    <br>
    <button
      class="btn btn-outline bg-red-500 mt-6 text-white"
      @click="reloadPage"
    >
      Повторить попытку
    </button>
  </p>
</template>
