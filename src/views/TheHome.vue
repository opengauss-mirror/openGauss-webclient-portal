<script setup>
import { ref } from 'vue';

const clientSrc = ref('http://localhost:8081/');
</script>

<template>
  <div class="home">
    <iframe :src="clientSrc" width="100%" height="100%"></iframe>
  </div>
</template>

<style lang="scss" scoped>
.home {
  width: 100vw;
  height: 100vh;
}
</style>
