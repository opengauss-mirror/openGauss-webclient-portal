import { LOGIN_STATUS } from '@/shared/login';
import { defineStore } from 'pinia';

// 登录
export const useLoginStore = defineStore('login', {
  state: () => {
    return {
      loginEvent: '',
      loginStatus: LOGIN_STATUS.NOT,
    };
  },
  actions: {
    setLoginEvent(envent) {
      this.loginEvent = envent;
    },
    setLoginStatus(status) {
      this.loginStatus = status;
    },
  },
  getters: {
    // 登录失败
    isLoginFailed() {
      return this.loginStatus === LOGIN_STATUS.NOT;
    },
    // 未登录
    isLoginNot() {
      return this.loginStatus === LOGIN_STATUS.NOT;
    },
    // 登录中
    isLoggingIn() {
      return this.loginStatus === LOGIN_STATUS.DOING;
    },
    // 登录成功
    isLogined() {
      return this.loginStatus === LOGIN_STATUS.DONE;
    },
  },
});
