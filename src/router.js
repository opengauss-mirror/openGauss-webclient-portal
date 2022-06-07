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
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
