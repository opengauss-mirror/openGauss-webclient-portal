<script setup>
import { watch } from 'vue';
import { useRouter } from 'vue-router';

import { logout } from '@/shared/login';
import { querySubdomain } from '@/api';
import { useLoginStore, useUserInfoStore } from '@/stores';

import config from '@/shared/config';
const router = useRouter();

const loginStore = useLoginStore();
const userInfoStore = useUserInfoStore();

watch(
  () => {
    return loginStore.isLogined;
  },
  (val) => {
    if (val) {
      try {
        querySubdomain(
          Object.assign(config, {
            token: userInfoStore.token,
          })
        ).then((data) => {
          if (data.code === 200) {
            userInfoStore.subdomain = data.instanceInfo.endPoint;
            router.push('/home');
          } else {
            console.error('获取课程信息错误！');
            logout();
          }
        });
      } catch (error) {
        console.error('获取课程信息错误！');
        logout();
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <router-view></router-view>
</template>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
