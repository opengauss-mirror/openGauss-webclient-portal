import { createRouter, createWebHistory } from 'vue-router';
import { doLogin } from './shared/login';
import { useLoginStore } from './stores';

export const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  // 登录页
  {
    path: '/login',
    name: 'login',
    component: () => {
      return import('@/views/TheLogin.vue');
    },
  },
  // webclient
  {
    path: '/home',
    name: 'home',
    component: () => {
      return import('@/views/TheHome.vue');
    },
    beforeEnter: async () => {
      const loginStore = useLoginStore();
      if (!loginStore.isLogined) {
        await doLogin();
      }
      if (!loginStore.isLogined) {
        return { name: 'login' };
      }
      return true;
    },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});
