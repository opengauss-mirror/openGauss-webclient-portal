<script setup>
import { useLoginStore, useUserInfoStore } from '@/stores';
import { doLogin } from '@/shared/login';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const loginStore = useLoginStore();
const userInfoStore = useUserInfoStore();
const router = useRouter();

if (!loginStore.isLogined) {
  if (localStorage.getItem('_U_T_')) {
    doLogin();
  } else {
    router.push('/login');
  }
}

const clientSrc = ref('');
const iframeIns = ref(null);
onMounted(() => {
  const iframeWin = iframeIns.value.contentWindow;

  watch(
    () => {
      return userInfoStore.subdomain;
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
