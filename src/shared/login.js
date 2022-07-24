import { AuthenticationClient } from 'authing-js-sdk';
import { useLoginStore, useUserInfoStore } from '@/stores';
import {
  queryAppId,
  queryIdToken,
  queryUserInfo,
  queryUserTokenInfo,
} from '@/api';

// 登录事件
export const LOGIN_EVENTS = {
  SHOW_LOGIN: 'show-login',
  LOGOUT: 'do-logout',
  LOGINED: 'logined',
};

// 登录状态
// -1: 登录失败；0：未登录；1：登录中；2：登录成功
export const LOGIN_STATUS = {
  FAILED: -1,
  NOT: 0,
  DOING: 1,
  DONE: 2,
};

const LOGIN_KEYS = {
  USER_TOKEN: '_U_T_',
  USER_INFO: '_U_I_',
};

function setStatus(status) {
  const loginStore = useLoginStore();
  loginStore.setLoginStatus(status);
}

// 存储用户id及token，用于下次登录
export function saveUserAuth(token) {
  if (!token) {
    localStorage.removeItem(LOGIN_KEYS.USER_TOKEN);
    resetStore();
  } else {
    localStorage.setItem(LOGIN_KEYS.USER_TOKEN, token);
  }
}

function initStore(token, domain) {
  if (!token) {
    resetStore();
  } else {
    const userInfoStore = useUserInfoStore();
    userInfoStore.token = token;
    userInfoStore.domain = domain;
  }
}

function resetStore() {
  const userInfoStore = useUserInfoStore();
  userInfoStore.$reset();
}

// 获取用户id及token
export function getUserAuth() {
  let token = localStorage.getItem(LOGIN_KEYS.USER_TOKEN);

  if (token === 'undefined') {
    saveUserAuth();
    token = '';
  }
  return {
    token,
  };
}

function afterLogined(token, domain) {
  if (!token) {
    setStatus(LOGIN_STATUS.FAILED);
    saveUserAuth();
    return console.error('用户信息不正确！');
  }

  initStore(token, domain);
  setStatus(LOGIN_STATUS.DONE);
}

// 请求用户信息
export async function requestUserInfo() {
  const { token } = getUserAuth();
  if (token) {
    try {
      setStatus(LOGIN_STATUS.DOING);
      const res = await queryUserInfo({
        token,
      });

      if (res.code === 200) {
        afterLogined(token, res.domain);
      } else {
        setStatus(LOGIN_STATUS.FAILED);
        saveUserAuth();
        throw new Error(res.code + ' ' + res.msg);
      }
    } catch (err) {
      setStatus(LOGIN_STATUS.FAILED);
      saveUserAuth();
      console.error('获取用户信息失败：', err);
    }
  }
}

function createClient(appId, appHost) {
  return new AuthenticationClient({
    appId,
    appHost,
    redirectUri: `${window.location.href}/`,
  });
}
// 开始鉴权
export async function goAuthorize() {
  const res = await queryAppId();
  if (res.code === 200) {
    const client = createClient(
      res.callbackInfo.appId,
      res.callbackInfo.appHost
    );
    // 构造 OIDC 授权登录 URL
    const url = client.buildAuthorizeUrl();
    const userInfoStore = useUserInfoStore();
    userInfoStore.loginUrl = url;
  }
}

// 退出
export function logout() {
  queryAppId().then((res) => {
    if (res.code === 200) {
      const client1 = createClient(
        res.callbackInfo.appId,
        res.callbackInfo.appHost
      );
      const { token } = getUserAuth();
      const idToken = await queryIdToken({ token });
      let logoutUrl = client1.buildLogoutUrl({
        protocol: 'oidc',
        expert: true,
        redirectUri: `${location.origin}/login`,
        idToken: idToken,
      });
      setStatus(LOGIN_STATUS.NOT);
      saveUserAuth();
      location.href = logoutUrl;
    }
  });
}

export async function getCodeByUrl() {
  const query = getUrlParam();
  if (query.code && query.state) {
    const param = {
      code: query.code,
      state: query.state,
    };
    const res = await queryUserTokenInfo(param);
    const { token = '' } = res;
    saveUserAuth(token);
    const newUrl = `${location.origin}/login`;
    window.location.href = null;
    window.parent.window.location.href = newUrl;
  }
}

export function getUrlParam(url = window.location.search) {
  const param = {};
  const arr = url.split('?');
  if (arr[1]) {
    const _arr = arr[1].split('&') || [];
    _arr.forEach((item) => {
      const it = item.split('=');
      if (it.length === 2) {
        param[it[0]] = it[1];
      }
    });
  }
  return param;
}
