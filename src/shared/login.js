import { Guard, GuardMode } from '@authing/native-js-ui-components';

import { useLoginStore } from '@/stores';
import { queryAppId } from '@/api';

let guard = null;
let authId = '';
let authIdentity = '';

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
  USER_ID: '_U_I_',
};

function setStatus(status) {
  const loginStore = useLoginStore();
  loginStore.setLoginStatus(status);
}

// 存储用户id及token，用于下次登录
export function saveUserAuth(id, token) {
  if (!id && !token) {
    localStorage.removeItem(LOGIN_KEYS.USER_ID);
    localStorage.removeItem(LOGIN_KEYS.USER_TOKEN);

    const userInfoStore = useUserInfoStore();
    userInfoStore.$reset();
  } else {
    localStorage.setItem(LOGIN_KEYS.USER_ID, id);
    localStorage.setItem(LOGIN_KEYS.USER_TOKEN, token);
  }
}

// 获取用户id及token
export function getUserAuth() {
  let token = localStorage.getItem(LOGIN_KEYS.USER_TOKEN);
  let id = localStorage.getItem(LOGIN_KEYS.USER_ID);
  if (token === 'undefined' || id === 'undefined') {
    saveUserAuth();
    token = '';
    id = 0;
  } else {
    id = parseInt(id);
  }
  return {
    id,
    token,
  };
}

function afterLogined(userInfo) {
  if (!userInfo || !userInfo.userId) {
    return;
  }

  const { userId, userToken } = userInfo;

  if (!userId || !userToken) {
    setStatus(LOGIN_STATUS.FAILED);
    saveUserAuth();
    return console.error('用户信息不正确！');
  }

  saveUserAuth(userId, userToken);
  setStatus(LOGIN_STATUS.DONE);
}

// 请求用户信息
export async function requestUserInfo() {
  const { id, token } = getUserAuth();
  if (id && token) {
    try {
      setStatus(LOGIN_STATUS.DOING);
      const res = await queryUserInfo({
        id,
        token,
      });

      if (res.code === 200) {
        afterLogined(res.userInfo);
      } else {
        setStatus(LOGIN_STATUS.FAILED);
        saveUserAuth();
        throw new Error(res.status + ' ' + res.msg);
      }
    } catch (err) {
      setStatus(LOGIN_STATUS.FAILED);
      saveUserAuth();
      console.error('获取用户信息失败：', err);
    }
  }
}

// 登录
export async function doLogin() {
  if (authId) {
    try {
      setStatus(LOGIN_STATUS.DOING);
      // 使用用户id和身份源id获取用户token及其他信息
      const res = await queryAuthentication({
        sub: authId,
        federationIdentityId: authIdentity,
      });

      if (res.code === 200) {
        afterLogined(res.userInfo);
      } else {
        throw new Error(res.status + ' ' + res.msg);
      }
    } catch (error) {
      setStatus(LOGIN_STATUS.FAILED);
      saveUserAuth();
      console.error('授权获取用户信息失败：', error);
    }
  } else {
    await requestUserInfo();
  }
}

/**
 * 调用登录组件
 * @returns
 */
export async function initGuard() {
  if (!guard) {
    try {
      const res = await queryAppId();
      if (res.code === 200) {
        // 初始化登录组件
        guard = new Guard(res.callbackInfo.appId, {
          title: 'TryMe',
          target: '.login-form',
          mode: GuardMode.Normal,
          clickCloseable: true,
          escCloseable: true,
        });
        guard.on('login', (authClient) => {
          if (authClient && authClient.id) {
            // 用户id
            authId = authClient.id;
            // 身份源id
            authIdentity = authClient.federationIdentityId || '';
            // 登录，获取用户token
            doLogin();

            setTimeout(() => {
              guard.hide();
              removeGuard();
            }, 300);
          }
        });
      } else {
        console.error('获取登录信息失败！');
      }
    } catch (error) {
      console.error('获取登录信息失败！');
    }
  }
  return guard;
}

// 开始鉴权
export async function goAuthorize() {
  const guard = await initGuard();
  if (guard) {
    guard.show();
  }
}

// 显示登录组件
export function showLogin() {
  const loginStore = useLoginStore();
  loginStore.loginStatus = LOGIN_EVENTS.SHOW_LOGIN;
}

// 退出
export function logout() {
  setStatus(LOGIN_STATUS.NOT);
  saveUserAuth();
}

// 重新登录
export function reLogin() {
  logout();
  goAuthorize();
}
