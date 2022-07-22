import { AuthenticationClient } from 'authing-js-sdk';
import { useLoginStore, useUserInfoStore } from '@/stores';
import { queryAppId, queryUserInfo, queryUserTokenInfo } from '@/api';

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
export function saveUserAuth(token, info) {
  if (!info && !token) {
    localStorage.removeItem(LOGIN_KEYS.USER_INFO);
    localStorage.removeItem(LOGIN_KEYS.USER_TOKEN);
    resetStore();
  } else {
    localStorage.setItem(LOGIN_KEYS.USER_INFO, JSON.stringify(info));
    localStorage.setItem(LOGIN_KEYS.USER_TOKEN, token);
  }
}

function initStore(token, id, domain) {
  if (!id && !token) {
    resetStore();
  } else {
    const userInfoStore = useUserInfoStore();
    userInfoStore.id = id;
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
  let _info = localStorage.getItem(LOGIN_KEYS.USER_INFO);
  let userInfo;
  let id;
  try {
    userInfo = JSON.parse(_info) || {};
  } catch (error) {
    userInfo = {};
  }
  if (token === 'undefined' || _info === 'undefined') {
    saveUserAuth();
    token = '';
    id = 0;
  } else {
    id = parseInt(userInfo.sub);
  }
  return {
    userInfo,
    id,
    token,
  };
}

function afterLogined(userInfo, domain) {
  if (!userInfo || !userInfo.userId) {
    return;
  }

  const { userId, userToken } = userInfo;

  if (!userId || !userToken) {
    setStatus(LOGIN_STATUS.FAILED);
    saveUserAuth();
    return console.error('用户信息不正确！');
  }

  initStore(userToken, userId, domain);
  setStatus(LOGIN_STATUS.DONE);
}

// 请求用户信息
export async function requestUserInfo() {
  const { id, token } = getUserAuth();
  if (id && token) {
    try {
      setStatus(LOGIN_STATUS.DOING);
      const res = await queryUserInfo({
        userId: id,
        token,
      });

      if (res.code === 200) {
        afterLogined(res.userInfo, res.domain);
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

const redirectUri = `${location.origin}/`;
function createClient(appId, appHost) {
  return new AuthenticationClient({
    appId: '621de88c40c828c2296cd1cc',
    appHost: 'https://tryme.authing.cn',
    redirectUri,
  });
}
// 开始鉴权
export async function goAuthorize() {
  queryAppId().then((res) => {
    if (res.code === 200) {
      const client = createClient(
        res.callbackInfo.appId,
        res.callbackInfo.appHost
      );
      // 构造 OIDC 授权登录 URL
      let url = client.buildAuthorizeUrl();
      // 如果需要获取 Refresh token，请在 scope 中加入 offline_access 项
      let url2 = client.buildAuthorizeUrl({
        scope: 'openid profile offline_access',
      });
      location.href = url;
      url2;
    }
  });
}

// 退出
export function logout() {
  queryAppId().then((res) => {
    if (res.code === 200) {
      const client1 = createClient(
        res.callbackInfo.appId,
        res.callbackInfo.appHost
      );
      const { userInfo } = getUserAuth();
      let logoutUrl = client1.buildLogoutUrl({
        protocol: 'oidc',
        expert: true,
        redirectUri,
        idToken: userInfo.idtoken,
      });
      setStatus(LOGIN_STATUS.NOT);
      saveUserAuth();
      location.href = logoutUrl;
    }
  });
}

export function getCodeByUrl() {
  const query = getUrlParam();
  if (query.code && query.state) {
    const param = {
      code: query.code,
      state: query.state,
    };
    queryUserTokenInfo(param).then((res) => {
      const {
        token = '',
        idtoken = '',
        user: { sub = '' },
      } = res;
      saveUserAuth(token, { sub, idtoken });
      // 去掉url中的code
      let newUrl = location.origin;
      if (window.history.replaceState) {
        window.history.replaceState({}, '', newUrl);
      } else {
        window.location.href = newUrl;
      }
      requestUserInfo();
    });
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
