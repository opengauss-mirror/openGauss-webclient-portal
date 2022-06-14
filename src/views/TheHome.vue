<script setup>
import { useLoginStore, useUserInfoStore } from '@/stores';
import { doLogin } from '@/shared/login';
import { onMounted, onUnmounted, ref, watch } from 'vue';
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

const handleMessage = (data) => {
  console.log(data);
};

const clientSrc = ref('');
const iframeIns = ref(null);
onMounted(() => {
  const iframeDom = iframeIns.value;
  const iframeWin = iframeIns.value.contentWindow;

  watch(
    () => {
      return userInfoStore.subdomain;
    },
    (val) => {
      if (val) {
        clientSrc.value = userInfoStore.subdomain;
        if (iframeDom.attachEvent) {
          iframeDom.attachEvent('onload', function () {
            iframeWin.postMessage(
              {
                token: userInfoStore.token,
                subdomain: userInfoStore.subdomain,
              },
              '*'
            );
          });
        } else {
          iframeDom.onload = function () {
            iframeWin.postMessage(
              {
                token: userInfoStore.token,
                subdomain: userInfoStore.subdomain,
              },
              '*'
            );
          };
        }
      }
    },
    { immediate: true }
  );
});

onUnmounted(() => {
  window.removeEventListener('message', handleMessage);
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
