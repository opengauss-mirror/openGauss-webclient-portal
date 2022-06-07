import { createRouter, createWebHistory } from 'vue-router';

export const routes = [
  {
    path: '/',
    redirect: '/login',
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
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});
