// ===== 通用工具函数 =====
window.Utils = {
  escapeHtml: function(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  formatDate: function(date, fmt) {
    if (!date) return '--';
    var d = typeof date === 'string' ? Utils._parseDbTime(date) : date;
    if (isNaN(d.getTime())) return '--';
    fmt = fmt || 'YYYY-MM-DD HH:mm:ss';
    var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
    var parts = {};
    try {
      new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(d).forEach(function(p) { if (p.type !== 'literal') parts[p.type] = p.value; });
    } catch (e) {}
    var Y = parts.year || String(d.getUTCFullYear());
    var M = parts.month || pad(d.getUTCMonth() + 1);
    var D = parts.day || pad(d.getUTCDate());
    var H = parts.hour || pad(d.getUTCHours() + 8);
    var m = parts.minute || pad(d.getUTCMinutes());
    var s = parts.second || pad(d.getUTCSeconds());
    return fmt
      .replace('YYYY', Y)
      .replace('MM', M)
      .replace('DD', D)
      .replace('HH', H)
      .replace('mm', m)
      .replace('ss', s);
  },

  // 解析数据库时间字符串（统一按 UTC 存储，无时区标记时补 Z）
  _parseDbTime: function(s) {
    if (s instanceof Date) return new Date(s.getTime());
    var v = String(s).trim();
    if (!v) return new Date(NaN);
    if (!/Z$|[+-]\d{2}:?\d{2}$/.test(v)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        v += 'T00:00:00Z';
      } else {
        if (v.indexOf('T') < 0) v = v.replace(' ', 'T');
        v += 'Z';
      }
    }
    return new Date(v);
  },

  formatTime: function(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  },

  shuffle: function(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  },

  debounce: function(fn, delay) {
    var timer = null;
    return function() {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
    };
  },

  throttle: function(fn, limit) {
    var last = 0;
    return function() {
      var now = Date.now();
      if (now - last >= limit) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  },

  copyToClipboard: function(text) {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text).then(function() { return true; }).catch(function() {
        return Utils._fallbackCopy(text);
      });
    }
    return Promise.resolve(Utils._fallbackCopy(text));
  },

  _fallbackCopy: function(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
    document.documentElement.appendChild(ta);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.documentElement.removeChild(ta);
    return ok;
  },

  getQueryParam: function(name) {
    var url = new URL(location.href);
    return url.searchParams.get(name);
  },

  sleep: function(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
  },

  countdown: function(seconds, onTick, onDone) {
    var remaining = seconds;
    if (onTick) onTick(remaining);
    var timer = setInterval(function() {
      remaining--;
      if (remaining <= 0) {
        clearInterval(timer);
        if (onDone) onDone();
      } else {
        if (onTick) onTick(remaining);
      }
    }, 1000);
    return function() { clearInterval(timer); };
  },

  // 网络异常统一提示文案（做题加载失败/提交失败时使用）
  netTip: function() {
    return '网络异常，请更换优质的网络环境后再试。广东、福建沿海地区因当地基站信号问题，有时会出现此类情况，可尝试更换网络（如切换 4G/5G/WiFi）或打开方式（如更换浏览器、清理缓存），或避开高峰时段再使用。';
  }
};

window.chinatime = function(s) {
  if (!s) return '--';
  try {
    return Utils._parseDbTime(s).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
  } catch (e) { return s; }
};
