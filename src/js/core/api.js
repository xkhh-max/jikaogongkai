// ===== 统一 API 客户端 =====
window.ApiClient = {
  _base: '/api',
  _cache: {},
  _cacheTTL: 300000,
  _cacheMax: 50,
  _cacheKeys: [],

  _getHeaders: function() {
    var headers = { 'Content-Type': 'application/json' };
    var token = localStorage.getItem('miltest_token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
  },

  _handleError: function(resp, data) {
    if (resp.status === 401) {
      if (data && data.code === 'KICKED') {
        if (typeof Auth !== 'undefined') Auth.logout();
        if (typeof showKickedModal === 'function') showKickedModal();
      } else {
        location.href = '/login?redirect=' + encodeURIComponent(location.pathname);
      }
    }
    if (resp.status === 403 && data && data.code === 'DEVICE_LIMIT') {
      showToast(data.msg || '账号绑定设备已达上限', 'error');
    }
    if (resp.status === 403 && data && (data.code === 'TRIAL_EXPIRED' || data.code === 'TRIAL_BLOCKED')) {
      var user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
      if (user) { user.account_type = 'trial'; Auth.setCurrentUser(user); }
    }
    if (resp.status === 429 && data && data.code === 'SCRAPE_BLOCKED') {
      showToast(data.msg || '检测到异常取题行为，请稍后再试', 'error'); return false;
    }
    if (resp.status === 429) { showToast('操作太频繁，请稍后再试','error'); return false; }
    if (resp.status === 502 || resp.status === 503) { showToast((typeof Utils !== 'undefined' && Utils.netTip) ? Utils.netTip() : '网络异常，请更换优质的网络环境后再试','error'); return false; }
  },

  _request: async function(method, path, body) {
    var cacheKey = method + ':' + path;
    if (method === 'GET') {
      var cached = this._cache[cacheKey];
      if (cached && Date.now() - cached.time < this._cacheTTL) return cached.data;
    }
    var opts = {
      method: method,
      headers: this._getHeaders()
    };
    if (body !== undefined) opts.body = JSON.stringify(body);
    var resp = await fetch(this._base + path, opts);
    var data;
    try { data = await resp.json(); } catch (e) { data = { success: false, msg: '响应解析失败' }; }
    if (!resp.ok) {
      if (this._handleError(resp, data) === false) data.msg = '';
    }
    if (method === 'GET' && resp.ok) {
      if (this._cacheKeys.length >= this._cacheMax) {
        var oldest = this._cacheKeys.shift();
        delete this._cache[oldest];
      }
      this._cacheKeys.push(cacheKey);
      this._cache[cacheKey] = { data: data, time: Date.now() };
    }
    return data;
  },

  get: async function(path) { return this._request('GET', path); },
  post: async function(path, body) { return this._request('POST', path, body); },
  patch: async function(path, body) { return this._request('PATCH', path, body); },
  delete: async function(path) { return this._request('DELETE', path); },

  clearCache: function(pathPrefix) {
    if (!pathPrefix) { this._cache = {}; this._cacheKeys = []; return; }
    for (var key in this._cache) {
      if (key.indexOf(pathPrefix) !== -1) delete this._cache[key];
    }
  },

  upload: async function(path, formData) {
    var headers = {};
    var token = localStorage.getItem('miltest_token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    var resp = await fetch(this._base + path, {
      method: 'POST',
      headers: headers,
      body: formData
    });
    var data;
    try { data = await resp.json(); } catch (e) { data = { success: false, msg: '响应解析失败' }; }
    if (!resp.ok && this._handleError(resp, data) === false) data.msg = '';
    return data;
  }
};
