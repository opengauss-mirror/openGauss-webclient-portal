<script setup>
import { useUserInfoStore } from '@/stores';
import { logout } from '@/shared/login';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
const userInfoStore = useUserInfoStore();

const router = useRouter();

const handleMessage = (e) => {
  const data = e.data;
  if (data.events === 'logout') {
    logout();
    router.go('/login');
  }
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
        clientSrc.value = 'http://localhost:8081/';
        if (iframeDom.attachEvent) {
          iframeDom.attachEvent('onload', function () {
            iframeWin.postMessage(
              {
                token: userInfoStore.token,
                domain: userInfoStore.domain,
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
                domain: userInfoStore.domain,
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

  window.addEventListener('message', handleMessage);
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
