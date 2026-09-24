// ===== 安全工具集 =====
window.SecurityKit = {
  _wmObserver: null,
  _devtoolsTimer: null,
  _copyThrottle: 0,
  _wmMode: null,

  _getUserLabel: function() {
    var user = (typeof Auth !== 'undefined' && Auth.getCurrentUser) ? Auth.getCurrentUser() : null;
    if (!user) {
      var now = new Date();
      var pad = function(n) { return n < 10 ? '0' + n : n; };
      return '访客 ' + now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    }
    var name = user.username || '用户';
    var contact = '';
    if (user.phone) {
      var p = String(user.phone);
      contact = p.length >= 7 ? p.slice(0, 3) + '****' + p.slice(-4) : p;
    } else if (user.email) {
      var em = String(user.email);
      var at = em.indexOf('@');
      contact = at > 2 ? em.slice(0, 2) + '***' + em.slice(at) : em;
    }
    var now = new Date();
    var pad = function(n) { return n < 10 ? '0' + n : n; };
    var dateStr = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    return name + (contact ? ' ' + contact : '') + ' ' + dateStr;
  },

  _buildWatermark: function(mode) {
    var text = this._getUserLabel();
    var el = document.getElementById('_security_wm');
    if (el) el.parentNode && el.parentNode.removeChild(el);
    el = document.createElement('div');
    el.id = '_security_wm';
    el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
    document.documentElement.appendChild(el);
    if (mode === 'test') {
      var c = document.createElement('canvas');
      c.width = 320; c.height = 240;
      var ctx = c.getContext('2d');
      ctx.clearRect(0, 0, 320, 240);
      ctx.font = '16px sans-serif';
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(160, 120);
      ctx.rotate(-30 * Math.PI / 180);
      for (var y = -120; y < 360; y += 60) {
        for (var x = -160; x < 480; x += 220) {
          ctx.fillText(text, x, y);
        }
      }
      el.style.backgroundImage = 'url(' + c.toDataURL() + ')';
      el.style.backgroundRepeat = 'repeat';
    } else {
      el.innerHTML = '<div style="position:fixed;bottom:12px;right:12px;pointer-events:none;z-index:9999;opacity:0.06;font-size:13px;transform:rotate(-20deg);white-space:nowrap">' + Utils.escapeHtml(text) + '</div>';
    }
  },

  _setupObserver: function() {
    if (this._wmObserver) this._wmObserver.disconnect();
    var self = this;
    this._wmObserver = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        for (var j = 0; j < mutations[i].removedNodes.length; j++) {
          if (mutations[i].removedNodes[j].id === '_security_wm') {
            self._buildWatermark(self._wmMode);
            return;
          }
        }
      }
    });
    this._wmObserver.observe(document.documentElement, { childList: true });
  },

  initSiteWatermark: function() {
    this._wmMode = 'site';
    this._buildWatermark('site');
    this._setupObserver();
  },

  initTestWatermark: function() {
    this._wmMode = 'test';
    this._buildWatermark('test');
    this._setupObserver();
  },

  initCopyProtection: function() {
    function isEditable(e) {
      var t = e.target;
      return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    }
    function handler(e) {
      if (isEditable(e)) return;
      e.preventDefault();
    }
    function toastHandler(e) {
      if (isEditable(e)) return;
      e.preventDefault();
      var now = Date.now();
      if (now - (SecurityKit._copyThrottle || 0) > 2000) {
        SecurityKit._copyThrottle = now;
        UiKit.toast('内容受保护，禁止复制', 'info');
      }
    }
    document.addEventListener('copy', toastHandler);
    document.addEventListener('cut', toastHandler);
    document.addEventListener('contextmenu', handler);
    document.addEventListener('selectstart', handler);
  },

  initDevToolsDetection: function() {
    if (this._devtoolsTimer) return undefined;
    var self = this;
    this._devtoolsTimer = setInterval(function() {
      var w = window.outerWidth - window.innerWidth;
      var h = window.outerHeight - window.innerHeight;
      if (w > 160 || h > 160) {
        console.warn('检测到开发者工具打开，请关闭以保护内容安全');
        // 若页面注册了上报钩子则触发（picbank 等受保护页面）
        if (typeof window._securityReportDevtools === 'function') {
          try { window._securityReportDevtools(); } catch (e) {}
        }
      }
    }, 2000);
    return function stop() {
      if (self._devtoolsTimer) {
        clearInterval(self._devtoolsTimer);
        self._devtoolsTimer = null;
      }
    };
  }
};
