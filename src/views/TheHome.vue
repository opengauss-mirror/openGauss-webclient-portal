<script setup>
import { useLoginStore, useUserInfoStore } from '@/stores';
import { onMounted, ref, watch } from 'vue';

const loginStore = useLoginStore();
const userInfoStore = useUserInfoStore();

const clientSrc = ref('');
const iframeIns = ref(null);
onMounted(() => {
  const iframeWin = iframeIns.value.contentWindow;

  watch(
    () => {
      return loginStore.isLogined;
    },
    (val) => {
      if (val) {
        clientSrc.value = userInfoStore.subdomain;
        iframeWin.postMessage(
          {
            token: userInfoStore.token,
            subdomain: userInfoStore.subdomain,
          },
          clientSrc.value
        );
      }
    },
    { immediate: true }
  );
});
</script>

<template>
  <div class="home">
    <iframe
      ref="iframeIns"
      :src="clientSrc"
      width="100%"
      height="100%"
    ></iframe>
  </div>
</template>

<style lang="scss" scoped>
.home {
  width: 100vw;
  height: 100vh;
}

iframe {
  border: none;
}
</style>
