<script setup>
import { doLogin } from '@/shared/login';

import logoImg from '@/assets/logo.png';

if (localStorage.getItem('_U_T_')) {
  doLogin();
} else {
  goAuthorize();
}
</script>

<template>
  <div class="login">
    <div class="login-header">
      <img :src="logoImg" alt="" />
    </div>

    <div class="login-content">
      <p class="login-title">openGauss数据库在线体验</p>
      <div class="login-form"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  width: 100%;
  height: 100vh;
  background-color: #7d32ea;
  background-image: url(../assets/banner.png);
  background-size: cover;
  background-repeat: no-repeat;
  overflow: auto;

  &-header {
    max-width: 1488px;
    margin: 0 auto;
    padding: 0 36px;
    height: 80px;
    display: flex;
    align-items: center;

    img {
      height: 30px;
    }
  }

  &-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100px 0 100px;

    .login-title {
      font-size: 64px;
      line-height: 84px;
      font-weight: 500;
      color: #ffffff;
      text-align: center;

      @media screen and (max-width: 1279px) {
        font-size: 54px;
        line-height: 76px;
      }

      @media screen and (max-width: 1023px) {
        font-size: 36px;
        line-height: 48px;
      }
    }

    .login-form {
      margin-top: 40px;
      // max-height: 40vh;
    }
  }
}
</style>
