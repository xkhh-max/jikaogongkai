// ===== 用户认证系统 (Cloudflare API 版) =====
var API_BASE = '/api';
(function(){
  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.indexOf('MilitaryTestAndroid') >= 0) {
    API_BASE = 'https://wuweisixing.cn/api';
    var origFetch = window.fetch;
    window.fetch = function(u, o) {
      if (typeof u === 'string' && u.startsWith('/api/')) u = 'https://wuweisixing.cn' + u;
      return origFetch.call(window, u, o);
    };
  }
})();

const Auth = {
  // ---- 本地缓存（同步） ----
  getCurrentUser() {
    const data = localStorage.getItem('miltest_current_user');
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('miltest_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('miltest_current_user');
    }
  },

  getToken() {
    return localStorage.getItem('miltest_token');
  },

  setToken(token) {
    if (token) localStorage.setItem('miltest_token', token);
    else localStorage.removeItem('miltest_token');
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  _authHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': 'Bearer ' + token } : {};
  },

  // ---- API 调用 ----
  async register(data) {
    localStorage.removeItem('miltest_kicked');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const body = { username: data.username, password: data.password, regCode: data.regCode };
      if (data.email) body.email = data.email;
      if (data.refCode) body.refCode = data.refCode;
      if (data.smsCode) body.smsCode = data.smsCode;
      if (data.emailCode) body.emailCode = data.emailCode;
      if (data.phone) body.phone = data.phone;
      if (data.education) body.education = data.education;
      if (data.region) body.region = data.region;
      if (data.fingerprint) body.fingerprint = data.fingerprint;
      if (data.turnstileToken) body.turnstileToken = data.turnstileToken;
      const res = await fetch(API_BASE + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('json')) {
        const result = await res.json();
        if (result.success && result.token) {
          this.setToken(result.token);
          this.setCurrentUser(result.user);
        }
        return result;
      }
      const text = await res.text();
      return { success: false, msg: '服务器返回异常，请稍后重试（' + res.status + '）' };
    } catch (e) {
      if (e.name === 'AbortError') { return { success: false, msg: '网络超时，请稍后重试' }; }
      return { success: false, msg: '网络错误，请检查服务器状态' };
    }
  },

  async upgradeAccount(regCode) {
    try {
      const token = this.getToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(API_BASE + '/auth/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ regCode }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.success) {
        // 刷新用户信息
        await this.getProfile();
      }
      return data;
    } catch (e) {
      if (e.name === 'AbortError') { return { success: false, msg: '网络超时，请稍后重试' }; }
      return { success: false, msg: '网络错误，请检查服务器状态' };
    }
  },

  async updateProfile(data) {
    try {
      const token = this.getToken();
      const res = await fetch(API_BASE + '/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) {
      return { success: false, msg: '网络错误，请检查服务器状态' };
    }
  },

  async login(email, password, fingerprint, turnstileToken) {
    localStorage.removeItem('miltest_kicked');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(API_BASE + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fingerprint, turnstileToken }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.success) {
        this.setToken(data.token);
        this.setCurrentUser(data.user);
      }
      return data;
    } catch (e) {
      if (e.name === 'AbortError') { return { success: false, msg: '网络超时，请稍后重试' }; }
      return { success: false, msg: '网络错误，请检查服务器状态' };
    }
  },

  async logout() {
    const token = this.getToken();
    if (token) {
      try {
        await fetch(API_BASE + '/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token }
        });
      } catch (e) { console.warn('[Auth]', e.message); }
    }
    this.setToken(null);
    this.setCurrentUser(null);
    localStorage.removeItem('miltest_kicked');
  },

  async getProfile() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(API_BASE + '/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.status === 401) {
        try {
          const data = await res.json();
          if (data && data.code === 'KICKED') {
            localStorage.setItem('miltest_kicked', '1');
            this.logout();
            showKickedModal();
            return null;
          }
        } catch (e) { console.warn('[Auth]', e.message); }
        this.setToken(null);
        this.setCurrentUser(null);
        return null;
      }
      const data = await res.json();
      if (data.success) {
        this.setCurrentUser(data.user);
        if (data.user && data.user.expired && typeof showExpiredPrompt === 'function') {
          showExpiredPrompt();
        }
        return data.user;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async getTestResult(testId) {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await fetch(API_BASE + '/results/' + testId, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.success ? data.result : null;
    } catch (e) {
      return null;
    }
  },

  // ---- 邀请相关 ----
  async getInviteCode() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await fetch(API_BASE + '/invite/code', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      return data.success ? data.code : null;
    } catch (e) {
      return null;
    }
  },

  async getInviteRecords() {
    const token = this.getToken();
    if (!token) return [];
    try {
      const res = await fetch(API_BASE + '/invite/records', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      return data.success ? data.records : [];
    } catch (e) {
      return [];
    }
  },

  async getInviteStats() {
    const token = this.getToken();
    if (!token) return { count: 0 };
    try {
      const res = await fetch(API_BASE + '/invite/stats', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      return data.success ? data : { count: 0 };
    } catch (e) {
      return { count: 0 };
    }
  },

  // ---- 积分相关 ----
  async getPoints() {
    const token = this.getToken();
    if (!token) return { points: 0, lifetime: 0 };
    try {
      const res = await fetch(API_BASE + '/points', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      return data.success ? data : { points: 0, lifetime: 0 };
    } catch (e) {
      return { points: 0, lifetime: 0 };
    }
  },

  // ---- 仪表盘 ----
  async getDashboardRecords() {
    const token = this.getToken();
    if (!token) return [];
    try {
      const res = await fetch(API_BASE + '/dashboard/records', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      return data.success ? data.records : [];
    } catch (e) {
      return [];
    }
  },

  // ---- 管理后台 ----
  async getAllUsers() {
    const token = this.getToken();
    if (!token) return {};
    try {
      const res = await fetch(API_BASE + '/admin/users', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (data.success) {
        const users = {};
        data.users.forEach(u => { users[u.email] = u; });
        return users;
      }
      return {};
    } catch (e) {
      return {};
    }
  },

  async deleteUser(email) {
    const token = this.getToken();
    if (!token) return;
    try {
      await fetch(API_BASE + '/admin/users/' + encodeURIComponent(email), {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
    } catch (e) { console.warn('[Auth]', e.message); }
  },

  async getNotices() {
    try {
      const res = await fetch(API_BASE + '/notices');
      const data = await res.json();
      return data.success ? data.notices : [];
    } catch (e) {
      return [];
    }
  },

  // ---- 本地缓存测试结果 ----
  async saveTestResult(testId, result) {
    try {
      localStorage.setItem('miltest_last_result_' + testId, JSON.stringify(result));
      return true;
    } catch(e) {
      return false;
    }
  },

};

// 页面加载时自动刷新 token
window.addEventListener('DOMContentLoaded', async () => {
  if (Auth.getToken() && !Auth.getCurrentUser()) {
    await Auth.getProfile();
  }
});

// ===== 设备踢出提示弹窗 =====
function showKickedModal() {
  if (document.getElementById('miltest-kicked-modal')) return;
  const div = document.createElement('div');
  div.id = 'miltest-kicked-modal';
  div.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:99999;';
  div.innerHTML = '<div style="background:var(--card-bg);border-radius:12px;padding:36px 40px;max-width:400px;width:90%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.25);">'
    + '<div style="width:56px;height:56px;margin:0 auto 16px;border-radius:50%;background:#fde8e8;display:flex;align-items:center;justify-content:center;">'
    + '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M15 9l-6 6M9 9l6 6"/></svg>'
    + '</div>'
    + '<h2 style="margin:0 0 6px;color:var(--danger);font-size:18px;">账号已在其他设备登录</h2>'
    + '<p style="color:var(--text-light);margin:0 0 24px;line-height:1.6;font-size:14px;">您的账号已在其他设备登录，当前会话已失效，请重新登录。</p>'
    + '<button onclick="localStorage.removeItem(\'miltest_kicked\');location.href=\'/login\'" style="background:var(--danger);color:#fff;border:none;padding:10px 36px;border-radius:8px;font-size:15px;cursor:pointer;font-weight:500;">确定</button>'
    + '</div>';
  document.documentElement.appendChild(div);
}

// ===== 到期续期提示弹窗 =====
function showExpiredPrompt() {
  if (typeof Auth !== 'undefined' && Auth.getCurrentUser) {
    var u = Auth.getCurrentUser();
    if (u) { u.account_type = 'trial'; Auth.setCurrentUser(u); }
  }
  if (document.getElementById('miltest-trial-modal')) return;
  var div = document.createElement('div');
  div.id = 'miltest-trial-modal';
  div.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:99999;';
  div.innerHTML = '<div style="background:var(--card-bg);border-radius:12px;padding:36px 40px;max-width:400px;width:90%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.25)">'
    + '<div style="width:56px;height:56px;margin:0 auto 16px;border-radius:50%;background:#fff3e0;display:flex;align-items:center;justify-content:center;">'
    + '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 8v4M12 16h.01"/></svg>'
    + '</div>'
    + '<h2 style="margin:0 0 6px;color:var(--warning);font-size:18px;">账号权益已到期</h2>'
    + '<p style="color:var(--text-light);margin:0 0 24px;line-height:1.6;font-size:14px;">您的正式/圆梦账号使用期限已到，当前已切换为体验模式。续期后即可恢复完整功能，继续使用。</p>'
    + '<button onclick="document.getElementById(\'miltest-trial-modal\').remove();location.href=\'/upgrade\'" style="background:var(--warning);color:#fff;border:none;padding:10px 36px;border-radius:8px;font-size:15px;cursor:pointer;font-weight:500;">去续期</button>'
    + '<button onclick="document.getElementById(\'miltest-trial-modal\').remove()" style="background:transparent;color:var(--text-light);border:none;padding:10px 20px;font-size:14px;cursor:pointer;margin-top:8px;display:block;width:100%;">暂不续期，先以体验模式使用</button>'
    + '</div>';
  document.documentElement.appendChild(div);
}

// ===== 全局 fetch 拦截器：检测 KICKED / TRIAL_EXPIRED 响应 =====
(function(){
  const origFetch = window.fetch;
  window.fetch = async function() {
    const resp = await origFetch.apply(this, arguments);
    if (resp.status === 401 && !resp.url.includes('/auth/me')) {
      try {
        const ct = resp.headers.get('content-type') || '';
        if (ct.includes('json')) {
          const clone = resp.clone();
          const data = await clone.json();
          if (data && data.code === 'KICKED') {
            Auth.logout();
            showKickedModal();
          } else {
            Auth.logout();
            if (!resp.url.includes('/auth/')) {
              var p = location.pathname;
              if (p !== '/login' && p !== '/register') {
                location.href = '/login?redirect=' + encodeURIComponent(p);
              }
            }
          }
        }
      } catch (e) { console.warn('[Auth]', e.message); }
    }
    if (resp.status === 403) {
      try {
        const ct = resp.headers.get('content-type') || '';
        if (ct.includes('json')) {
          const clone = resp.clone();
          const data = await clone.json();
          if (data && (data.code === 'TRIAL_EXPIRED' || data.code === 'TRIAL_BLOCKED')) {
            var user = Auth.getCurrentUser();
            if (user) { user.account_type = 'trial'; Auth.setCurrentUser(user); }
            if (typeof showExpiredPrompt === 'function') showExpiredPrompt();
          }
        }
      } catch (e) { console.warn('[Auth]', e.message); }
    }
    return resp;
  };
})();
