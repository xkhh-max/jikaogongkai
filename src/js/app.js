// ===== 共享应用逻辑 =====

// ===== 全局页面过渡 & 加载条 =====
(function(){
  var bar=null,mask=null,tid=null;
  function ensureBar(){
    if(bar)return bar;
    bar=document.createElement('div');bar.className='g-loading-bar';document.documentElement.appendChild(bar);
    return bar;
  }
  function ensureMask(){
    if(mask)return mask;
    mask=document.createElement('div');mask.className='g-transition-mask';mask.innerHTML='<div class="spinner"></div>';document.documentElement.appendChild(mask);
    return mask;
  }
  window.GLoading={
    start:function(){clearTimeout(tid);var b=ensureBar();b.className='g-loading-bar';void b.offsetWidth;b.classList.add('active')},
    done:function(){var b=ensureBar();b.classList.remove('active');b.classList.add('done');tid=setTimeout(function(){b.className='g-loading-bar';tid=null},600)},
    showMask:function(){ensureMask().classList.add('on')},
    hideMask:function(){if(mask)mask.classList.remove('on')}
  };
  window.addEventListener('load',function(){GLoading.done()});
  // 入场动画结束后必须移除类：fill-mode both 残留的 transform:translateY(0)
  // 会使 body 成为 fixed 元素的包含块，导致悬浮按钮掉到"页面底部"而非"屏幕底部"
  function pageEnter(){
    var b=document.body;
    b.classList.remove('g-page-enter');
    void b.offsetWidth;
    b.classList.add('g-page-enter');
    clearTimeout(b._enterTid);
    b._enterTid=setTimeout(function(){b.classList.remove('g-page-enter')},500);
  }
  document.addEventListener('DOMContentLoaded',function(){
    // 确保过渡遮罩在新页面加载时立即清除（防止跨页面残留）
    if(mask){mask.classList.remove('on');mask.style.opacity='0';mask.style.pointerEvents='none'}
    pageEnter();
    document.addEventListener('click',function(e){
      if(e.button!==0||e.defaultPrevented)return;
      var a=e.target.closest('a[href]');
      if(!a)return;
      var href=a.getAttribute('href');
      if(!href||href.startsWith('#')||href.startsWith('javascript:')||href.startsWith('//')||href.startsWith('http')||href.startsWith('mailto:')||href.startsWith('tel:'))return;
      if(a.target==='_blank'||e.ctrlKey||e.metaKey||e.shiftKey)return;
      e.preventDefault();
      GLoading.start();
      setTimeout(function(){location.href=href},200);
    });
    // 自动修复"返回首页"链接 → history.back()
    // 排除"旧版首页"等导航链接（它们应该真正指向首页）
    document.querySelectorAll('a[href="index.html"], a[href="/"]').forEach(function(a){
          var txt=(a.textContent||'').trim();
          if((txt.indexOf('返回')!==-1||txt.indexOf('←')!==-1)&&txt.indexOf('旧版')===-1&&txt.indexOf('经典')===-1){
            a.removeAttribute('href');
            a.style.cursor='pointer';
            a.addEventListener('click',function(ev){
              ev.preventDefault();
              if(window.history.length>1){window.history.back()}
              else{location.href='/'}
            });
          }
        });
  });
  window.addEventListener('pageshow',function(e){
    if(e.persisted){pageEnter();GLoading.done()}
    _scrollLockCount=0;
    document.body.style.paddingRight='';
    document.documentElement.style.overflow='';
    document.body.style.overflow='';
  });
})();

// ===== 全局 ESC 键关闭弹窗 =====
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    // 按 z-index 从高到低依次尝试关闭
    var popupOverlay=document.querySelector('.popup-overlay:not(.hidden)');
    if(popupOverlay){var btn=popupOverlay.querySelector('.popup-close-btn');if(btn)btn.click();return}
    var modals=document.querySelectorAll('.modal-overlay.show,.hidden-modal.show,.shop-overlay.active,.device-modal.show,.user-detail-modal.show,.wrong-modal.show');
    if(modals.length>0){var last=modals[modals.length-1];var closeBtn=last.querySelector('.modal-close,.hidden-modal-close,.shop-close,.wrong-modal-close,[onclick*="close"]');if(closeBtn)closeBtn.click();return}
    var previewModal=document.querySelector('.preview-modal.active');
    if(previewModal){var closeBtn=previewModal.querySelector('.modal-close');if(closeBtn)closeBtn.click();return}
    var ukModal=document.querySelector('.uk-modal-overlay');
    if(ukModal && ukModal.parentNode){ukModal.click();return}
  }
});

// ===== 全局 Toast =====
function gToast(msg,type,duration){UiKit.toast(msg,type,duration)}

// ===== Body 滚动锁定（overflow:hidden 方案）=====
// 弹窗内滚动区需要设 overflow-y:auto + -webkit-overflow-scrolling:touch，
// 不能设 touchAction:none（会吞掉弹窗内部的 touch 事件）。
var _scrollLockCount=0;
var _scrollY=0;
function lockBodyScroll(){
   if(_scrollLockCount===0){
     _scrollY=window.scrollY||window.pageYOffset||document.documentElement.scrollTop||0;
     var sw=window.innerWidth-document.documentElement.clientWidth;
     document.body.style.paddingRight=sw+'px';
     document.documentElement.style.overflow='hidden';
     document.body.style.overflow='hidden';
   }
   _scrollLockCount++;
 }
function unlockBodyScroll(){
  _scrollLockCount--;
  if(_scrollLockCount<=0){
    _scrollLockCount=0;
    document.body.style.paddingRight='';
    document.documentElement.style.overflow='';
    document.body.style.overflow='';
    window.scrollTo(0,_scrollY);
  }
}
window.lockBodyScroll=lockBodyScroll;
window.unlockBodyScroll=unlockBodyScroll;

// ===== 视口定位弹窗工具 =====
function showModalAtViewport(modalId, openFunc) {
  var modal = document.getElementById(modalId);
  if (!modal) return;
  // 先解锁确保获取正确视口位置
  var scrollY = window.scrollY || window.pageYOffset || 0;
  // 锁定滚动
  lockBodyScroll();
  // 添加显示类
  modal.classList.add('show');
  // 弹窗内容自动居中（CSS flexbox 已处理）
  // 如果弹窗高度超出视口，滚动到合适位置
  var modalContent = modal.querySelector('.hidden-modal-content, .coming-modal-content, .elite-modal-content');
  if (modalContent) {
    var rect = modalContent.getBoundingClientRect();
    var viewportHeight = window.innerHeight;
    if (rect.height > viewportHeight * 0.9) {
      modalContent.style.marginTop = '0';
    }
  }
}
function closeModalAtViewport(modalId, closeFunc) {
  var modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('show');
  unlockBodyScroll();
}

// ===== 按钮 loading 辅助 =====
function btnLoading(btn,loading,text){UiKit.btnLoading(btn,loading,text)}

// ===== HTML 转义工具函数 =====
var escapeHtml = Utils.escapeHtml;

// ===== 用户导航（下拉菜单版） =====
function renderUserMenu() {
  const user = Auth.getCurrentUser();
  const navEl = document.getElementById('userNav');
  if (!navEl) return;
  if (user) {
    const initial = (user.username || '?').charAt(0).toUpperCase();
    const safeName = escapeHtml(user.username || '');
    const typeColors = { trial:'#e65100', formal:'#2E7D32', elite:'#7b1fa2' };
    const typeBgColors = { trial:'#fff3e0', formal:'#e8f5e9', elite:'#f3e5f5' };
    const typeLabel = user.account_type === 'trial' ? '体验' : (user.account_type === 'formal' ? '正式' : (user.account_type === 'elite' ? '圆梦' : '--'));
    const roleLabel = user.role === 'admin' ? '管理员' : (typeLabel + '用户');
    const acctColor = typeColors[user.account_type] || '#999';
    const acctBg = typeBgColors[user.account_type] || '#f5f5f5';
    let adminItem = '';
    if (user.role === 'admin') {
      adminItem = '<a href="/admin" class="dropdown-item"><span class="icon">⚙️</span>管理后台</a>';
    }
    const currentTheme = localStorage.getItem('miltest_theme') || '';
    const themes = [
      { key: '', color: '#004499', name: '经典蓝' },
      { key: 'dark', color: '#2a2a30', name: '磨砂黑' },
      { key: 'green', color: '#3C6B3C', name: '军绿迷彩' },
      { key: 'wechat', color: '#07C160', name: '微信绿' },
      { key: 'pink', color: '#CD8FA0', name: '淡粉' }
    ];
    const dotsHtml = themes.map(function(t) {
      return '<span class="theme-dot' + (currentTheme === t.key ? ' active' : '') + '" style="background:' + t.color + '" title="' + t.name + '" onclick="setTheme(\'' + t.key + '\')"></span>';
    }).join('');
    navEl.innerHTML = `
      <div class="user-menu">
        <button class="user-menu-btn" onclick="toggleUserMenu(event)" title="${safeName}">
          <span class="user-avatar">${initial}</span>
          ${safeName} <span class="arrow" id="menuArrow">▼</span>
        </button>
        <div class="user-dropdown" id="userDropdown">
          <div class="dropdown-header">
            ${safeName}
            <div class="sub" style="background:${acctBg};color:${acctColor};padding:2px 10px;border-radius:10px;display:inline-block;font-size:11px;font-weight:600;margin-top:4px">${roleLabel}</div>
          </div>
          <a href="/home" class="dropdown-item"><span class="icon">🏠</span>新版首页</a>
          <a href="/index" class="dropdown-item"><span class="icon">🏚</span>旧版首页</a>
          <div class="dropdown-divider"></div>
          <a href="/dashboard" class="dropdown-item"><span class="icon">📊</span>个人中心</a>
          <a href="/invite" class="dropdown-item"><span class="icon">📨</span>邀请好友</a>
          ${adminItem}
          <div class="dropdown-divider"></div>
          <a href="/community" class="dropdown-item"><span class="icon">💬</span>用户社区</a>
          <a href="/shop" class="dropdown-item"><span class="icon">🛒</span>积分商城</a>
          <div class="dropdown-divider"></div>
          <div class="theme-section"><span class="theme-label">主题</span><div class="theme-dots">${dotsHtml}</div></div>
          <div class="dropdown-divider"></div>
          <a href="/download" class="dropdown-item"><span class="icon">📦</span>下载App</a>
          <div class="dropdown-divider"></div>
          <a href="/logout" class="dropdown-item danger"><span class="icon">🚪</span>退出登录</a>
        </div>
      </div>
    `;
  } else {
    navEl.innerHTML = `
      <a href="/login" class="login-btn">登录</a>
      <a href="/register" class="reg-btn">注册</a>
    `;
  }
}

function toggleUserMenu(e) {
  e.stopPropagation();
  const dd = document.getElementById('userDropdown');
  if (!dd) return;
  dd.classList.toggle('show');
  const arrow = document.getElementById('menuArrow');
  if (arrow) arrow.classList.toggle('open', dd.classList.contains('show'));
}

// 点击外部关闭下拉菜单
document.addEventListener('click', function(e) {
  const dd = document.getElementById('userDropdown');
  if (dd && !e.target.closest('.user-menu')) {
    dd.classList.remove('show');
    const arrow = document.getElementById('menuArrow');
    if (arrow) arrow.classList.remove('open');
  }
});

// ===== 主题切换 =====
function setTheme(theme) {
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('miltest_theme', theme || '');
  document.querySelectorAll('.theme-dot').forEach(function(dot) {
    dot.classList.toggle('active', dot.getAttribute('title') === (function(){
      var names = {'':'经典蓝','dark':'磨砂黑','green':'军绿迷彩','wechat':'微信绿','pink':'淡粉'};
      return names[theme] || '经典蓝';
    })());
  });
  renderUserMenu();
}
(function() {
  var saved = localStorage.getItem('miltest_theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

// ============================================================
// 通知喇叭系统 — 单行滚动
// ============================================================
var NoticeBar = {
  _elSys: null,
  _elAct: null,
  _elBar: null,
  _elScroll: null,
  _timer: 0,
  _paused: false,

  init: function() {
    this._elSys = document.getElementById('noticeTrackSys');
    this._elAct = document.getElementById('noticeTrackAct');
    this._elBar = document.getElementById('noticeBar');
    this._elScroll = document.querySelector('.notice-scroll');
    if (!this._elSys || !this._elAct) return;

    // 检查当天是否已关闭
    if (this._isDismissedToday()) {
      if (this._elBar) this._elBar.classList.add('notice-hidden');
      return;
    }

    var self = this;
    this.refresh();
    this._startTimer();
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        self._stopTimer();
      } else {
        self.refresh();
        self._startTimer();
      }
    });

    // 点击暂停/恢复
    if (this._elScroll) {
      this._elScroll.addEventListener('click', function(e) {
        if (e.target.closest('.notice-close')) return;
        self.togglePause();
      });
    }
  },

  _isDismissedToday: function() {
    try {
      var d = localStorage.getItem('miltest_notice_hide');
      if (!d) return false;
      var today = new Date();
      var y = today.getFullYear();
      var m = String(today.getMonth() + 1).padStart(2, '0');
      var day = String(today.getDate()).padStart(2, '0');
      return d === y + '-' + m + '-' + day;
    } catch(e) { return false; }
  },

  togglePause: function() {
    this._paused = !this._paused;
    if (this._elScroll) {
      this._elScroll.classList.toggle('notice-paused', this._paused);
    }
  },

  dismiss: function() {
    if (!this._elBar) return;
    try {
      var today = new Date();
      var y = today.getFullYear();
      var m = String(today.getMonth() + 1).padStart(2, '0');
      var day = String(today.getDate()).padStart(2, '0');
      localStorage.setItem('miltest_notice_hide', y + '-' + m + '-' + day);
    } catch(e) {}
    this._elBar.classList.add('notice-hidden');
    this._stopTimer();
  },

  _startTimer: function() {
    var self = this;
    this._stopTimer();
    this._timer = setInterval(function() { self.refresh(); }, 180000);
  },

  _stopTimer: function() {
    if (this._timer) { clearInterval(this._timer); this._timer = 0; }
  },

  refresh: async function() {
    try {
      var results = await Promise.all([
        fetch(API_BASE + '/notifications/active').then(function(r) { return r.json(); }).catch(function() { return {}; }),
        fetch(API_BASE + '/notices').then(function(r) { return r.json(); }).catch(function() { return {}; })
      ]);

      var sysItems = [];
      var actItems = [];

      // 第一行：系统通知
      var notifs = results[0].notifications || [];
      notifs.forEach(function(n) {
        var c = escapeHtml(n.content);
        var inner = '<span class="dot"></span>' + c;
        if (n.link) {
          sysItems.push('<a href="' + escapeHtml(n.link) + '" class="notice-item sys" target="_blank" rel="noopener">' + inner + '</a>');
        } else {
          sysItems.push('<span class="notice-item sys">' + inner + '</span>');
        }
      });

      // 第二行：做题动态
      var notices = results[1].notices || [];
      notices.forEach(function(n) {
        var g = n.grade ? ' <span class="grade-tag">' + escapeHtml(n.grade) + '</span>' : '';
        actItems.push('<span class="notice-item"><span class="dot"></span>' + escapeHtml(n.icon) + ' ' + escapeHtml(n.user) + escapeHtml(n.action) + g + ' <span class="time">' + escapeHtml(n.time) + '</span></span>');
      });

      this._render(sysItems, actItems);
    } catch(e) { console.error('NoticeBar:', e); }
  },

  _render: function(sysItems, actItems) {
    // 第一行：系统通知
    if (sysItems.length) {
      this._elSys.innerHTML = sysItems.join('') + sysItems.join('');
    } else {
      this._elSys.innerHTML = '<span class="notice-item" style="color:var(--text);display:inline-flex;align-items:center;gap:6px">暂无系统通知</span>';
    }
    // 第二行：做题动态
    if (actItems.length) {
      this._elAct.innerHTML = actItems.join('') + actItems.join('');
    } else {
      this._elAct.innerHTML = '<span class="notice-item" style="color:var(--text);display:inline-flex;align-items:center;gap:6px">暂无做题动态</span>';
    }
    // iOS Safari 在内容注入后不自动重启 CSS 动画，强制重新触发
    var self = this;
    if (this._elSys && this._elSys.animate) {
      var sys = this._elSys;
      var act = this._elAct;
      requestAnimationFrame(function() {
        [sys, act].forEach(function(el) {
          el.style.animation = 'none';
          void el.offsetWidth;
          el.style.animation = '';
        });
      });
    }
  }
};// 页面卸载时清理 NoticeBar 定时器
window.addEventListener('beforeunload', function() {
  if (NoticeBar._timer) {
    clearInterval(NoticeBar._timer);
    NoticeBar._timer = 0;
  }
});

// ===== 返回顶部按钮（仅手机端，滚动超过600px显示） =====
var BackTop = {
  _btn: null,
  _ticking: false,
  init: function() {
    if (this._btn) return;
    if (!document.body) return;
    // 页面已有自己的返回顶部按钮（如 tijian.html）则不重复添加
    if (document.querySelector('.back-top')) return;
    var btn = document.createElement('button');
    btn.className = 'g-back-top';
    btn.type = 'button';
    btn.title = '返回顶部';
    btn.setAttribute('aria-label', '返回顶部');
    btn.textContent = '↑';
    var self = this;
    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(btn);
    this._btn = btn;
    window.addEventListener('scroll', function() { self._onScroll(); }, { passive: true });
    this._onScroll();
  },
  _onScroll: function() {
    var self = this;
    if (this._ticking) return;
    this._ticking = true;
    requestAnimationFrame(function() {
      self._ticking = false;
      if (self._btn) self._btn.classList.toggle('show', window.scrollY > 600);
    });
  }
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { BackTop.init(); });
} else {
  BackTop.init();
}

// 页面初始化
async function initPage() {
  renderUserMenu();
  BackTop.init();
  // 延迟非关键初始化，优先渲染首屏
  if ('requestIdleCallback' in window) {
    requestIdleCallback(function(){ NoticeBar.init(); }, { timeout: 3000 });
  } else {
    setTimeout(function(){ NoticeBar.init(); }, 1000);
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(function(){ PopupNotice.init(); }, { timeout: 2000 });
  } else {
    setTimeout(function(){ PopupNotice.init(); }, 1500);
  }
}

// 检查登录
function checkLogin(redirect) {
  if (Auth.isLoggedIn()) {
    if (redirect) location.href = redirect;
    return true;
  } else {
    try { sessionStorage.setItem('login_redirect_toast', '1'); } catch(e) {}
    location.href = '/login?redirect=' + encodeURIComponent(redirect || '/');
    return false;
  }
}

// ===== 弹窗通知 =====
const PopupNotice = {
  overlay: null,
  notifications: [],
  currentIdx: 0,

  async init() {
    // 注册/登录/测试等页面不弹通知，避免遮罩阻挡操作
    var skipPaths = ['/register','/login','/forgot_password','/test','/simulation','/sbti','/admin','/picbank'];
    if (skipPaths.some(function(p) { return location.pathname.indexOf(p) === 0; })) return;
    var dismissed = [], sessionDismissed = [];
    try {
      dismissed = JSON.parse(localStorage.getItem('miltest_popup_dismissed') || '[]');
    } catch(e) { dismissed = []; }
    try {
      sessionDismissed = JSON.parse(sessionStorage.getItem('miltest_popup_session') || '[]');
    } catch(e) { sessionDismissed = []; }
    try {
      var res = await fetch('/api/notifications/popup');
      var data = await res.json();
      if (!data.success || !data.notifications || data.notifications.length === 0) return;
      this.notifications = data.notifications.filter(function(n) {
        if (n.dismiss_mode === 'session') return sessionDismissed.indexOf(n.id) === -1;
        if (n.dismiss_mode === 'once') return dismissed.indexOf(n.id) === -1;
        return true;
      });
      if (this.notifications.length === 0) return;
      this.currentIdx = 0;
      this.show();
    } catch(e) { console.warn('[App]', e.message); }
  },

  show() {
    var self = this;
    if (this.currentIdx >= this.notifications.length) { this.destroy(); return; }
    var n = this.notifications[this.currentIdx];
    if (!n) { this.destroy(); return; }
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'popup-overlay hidden';
      this.overlay.innerHTML =
        '<div class="popup-box">' +
          '<div class="popup-header" id="popupHeader">' +
            '<h3 id="popupTitle">📢 通知</h3>' +
            '<button class="popup-close-btn" id="popupCloseBtn">&times;</button>' +
          '</div>' +
          '<div class="popup-body">' +
            '<div class="popup-badge" id="popupBadge"></div>' +
            '<div class="popup-content" id="popupContent"></div>' +
          '</div>' +
          '<div class="popup-footer" id="popupFooter">' +
            '<a href="/trial" class="popup-btn popup-btn-secondary" id="popupGuideBtn" style="flex:1;display:flex;align-items:center;justify-content:center;text-decoration:none">📖 新用户必看</a>' +
            '<button class="popup-btn popup-btn-primary" id="popupDismissBtn">我知道了</button>' +
          '</div>' +
           '<div style="padding:8px 20px 14px;font-size:11px;color:var(--text-lighter,#999);text-align:center;border-top:1px solid var(--border,#e5e7eb);line-height:1.6">⚠️ 本站测试题库部分内容来自公开数据和原创首发，为维护相关权益和本站著作权，如发现其他平台与本站相似题库内容均属抄袭，请截图拍照保留证据<a href="/copyright" style="color:var(--accent);text-decoration:underline" target="_blank">举报至本站</a>，核查后最高奖励10000元！</div>' +
        '</div>';
      document.documentElement.appendChild(this.overlay);
      this.overlay.addEventListener('click', function(e) { if (e.target === self.overlay) self.dismiss(); });
      document.getElementById('popupCloseBtn').addEventListener('click', function() { self.dismiss(); });
      document.getElementById('popupDismissBtn').addEventListener('click', function() { self.dismiss(); });

    }
    var header = document.getElementById('popupHeader');
    header.className = 'popup-header ' + (n.type || 'info');
    document.getElementById('popupTitle').textContent = n.type === 'urgent' ? '⚠️ 紧急通知' : n.type === 'warning' ? '⚠️ 警告' : '📢 通知';
    var badge = document.getElementById('popupBadge');
    badge.className = 'popup-badge ' + (n.type || 'info');
    badge.textContent = n.type === 'urgent' ? '紧急' : n.type === 'warning' ? '警告' : '通知';
    document.getElementById('popupContent').textContent = n.content;
    this.overlay.classList.remove('hidden');
    this.overlay.classList.add('show');
    window.lockBodyScroll();
  },

  dismiss() {
    var self = this;
    var n = this.notifications[this.currentIdx];
    if (n) {
      try {
        if (n.dismiss_mode === 'session') {
          var sd = JSON.parse(sessionStorage.getItem('miltest_popup_session') || '[]');
          if (sd.indexOf(n.id) === -1) sd.push(n.id);
          sessionStorage.setItem('miltest_popup_session', JSON.stringify(sd));
        } else if (n.dismiss_mode === 'once') {
          var d = JSON.parse(localStorage.getItem('miltest_popup_dismissed') || '[]');
          if (d.indexOf(n.id) === -1) d.push(n.id);
          localStorage.setItem('miltest_popup_dismissed', JSON.stringify(d));
        }
      } catch(e) { console.warn('[App]', e.message); }
    }
    this.overlay.classList.remove('show');
    this.overlay.classList.add('hidden');
    this.currentIdx++;
    window.unlockBodyScroll();
    if (this.currentIdx < this.notifications.length) {
      setTimeout(function() { self.show(); }, 300);
    } else {
      this.destroy();
    }
  },

  destroy() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
    this.notifications = [];
    this.currentIdx = 0;
  }
};

// ===== 共享结果渲染工具函数 =====
function renderScaleBars(containerId, data, thresholds) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var html = '';
  Object.keys(data).forEach(function(k) {
    var val = data[k];
    var pct = Math.min(val, 100);
    var color;
    if (!thresholds) {
      color = val < 60 ? '#e74c3c' : val < 75 ? '#f39c12' : '#27ae60';
    } else {
      color = val > thresholds[k] ? '#e74c3c' : '#27ae60';
    }
    html += '<div class="scale-row"><span class="sname">' + escapeHtml(k) + '</span>' +
      '<div class="sbar"><div class="sfill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
      '<span class="sval" style="color:' + color + '">' + val + '</span></div>';
  });
  container.innerHTML = html;
}

function getGradeInfo(grade) {
  var map = {
    'A': { className: 'grade-A', color: '#22C55E', desc: '优秀' },
    'B': { className: 'grade-B', color: '#1E3A8A', desc: '良好' },
    'C': { className: 'grade-C', color: '#e67e22', desc: '合格' },
    'D': { className: 'grade-D', color: '#e74c3c', desc: '待提高' }
  };
  return map[grade] || map['D'];
}

window.renderScaleBars = renderScaleBars;
window.getGradeInfo = getGradeInfo;
(function() {
  window.addEventListener('error', function(e) {
    try {
      const body = JSON.stringify({
        message: e.message,
        url: e.filename || location.href,
        line: e.lineno,
        col: e.colno,
        error: e.error ? e.error.stack : '',
        type: 'error'
      });
      navigator.sendBeacon('/api/log/client-error', body);
    } catch (ex) { console.warn('[App]', ex.message); }
  });
  window.addEventListener('unhandledrejection', function(e) {
    try {
      const body = JSON.stringify({
        message: e.reason?.message || String(e.reason),
        type: 'unhandledrejection',
        error: e.reason?.stack || ''
      });
      navigator.sendBeacon('/api/log/client-error', body);
    } catch (ex) { console.warn('[App]', ex.message); }
  });
})();

function initTestWatermark() { if (window.SecurityKit) SecurityKit.initTestWatermark(); }
function initSiteWatermark() { if (window.SecurityKit) SecurityKit.initSiteWatermark(); }

// 工具
window.checkLogin = checkLogin;
window.toggleUserMenu = toggleUserMenu;
window.initTestWatermark = initTestWatermark;
window.initSiteWatermark = initSiteWatermark;
window.setTheme = setTheme;

// === 账户过期提醒（右下角小通知，每天最多弹一次）===
(function(){
  var exp = Auth && Auth.getCurrentUser && Auth.getCurrentUser();
  if(exp && exp.expires_at && exp.account_type === 'formal'){
    var today = Utils.formatDate(new Date(), 'YYYY-MM-DD');
    var lastShown = localStorage.getItem('miltest_expiry_notice');
    if(lastShown === today) return;
    var now = Date.now(), expiry = Utils._parseDbTime(exp.expires_at).getTime();
    var hoursLeft = Math.ceil((expiry - now) / 3600000);
    if(expiry > now && hoursLeft <= 24){
      localStorage.setItem('miltest_expiry_notice', today);
      var timeText = hoursLeft <= 1 ? '不到1小时' : hoursLeft + '小时';
      setTimeout(function(){
        var w = document.createElement('div');
        w.style.cssText = 'position:fixed;bottom:80px;right:20px;max-width:320px;background:var(--card-bg);border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:10px;padding:14px 16px;box-shadow:0 4px 20px rgba(0,0,0,.12);z-index:99990;font-size:13px;line-height:1.6;animation:slideInRight .3s ease';
        w.innerHTML = '<div style="display:flex;align-items:flex-start;gap:10px"><span style="font-size:20px;flex-shrink:0">⏰</span><div><div style="font-weight:700;color:rgba(var(--warning-rgb),.9);margin-bottom:4px">账号即将过期</div><div style="color:#78716c">剩余 <strong style="color:rgba(var(--warning-rgb),.9)">' + timeText + '</strong> 后自动转为体验账号</div><a href="/upgrade" style="display:inline-block;margin-top:8px;color:#2563eb;font-weight:600;font-size:12px;text-decoration:none">立即续期 →</a></div><button onclick="this.closest(\'div[style]\').remove()" style="background:none;border:none;color:#aaa;cursor:pointer;font-size:16px;padding:0 0 0 8px;flex-shrink:0">✕</button></div>';
        if(!document.getElementById('slideInRightStyle')){
          var s=document.createElement('style');s.id='slideInRightStyle';s.textContent='@keyframes slideInRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}';document.head.appendChild(s);
        }
        document.documentElement.appendChild(w);
        setTimeout(function(){ if(w.parentNode) w.style.opacity='0'; setTimeout(function(){ if(w.parentNode) w.remove(); }, 400); }, 15000);
      }, 1000);
    }
  }
 })();

// ===== 客户端版本更新检查 =====
(function(){
  var matchUA = navigator.userAgent.match(/MilitaryTestAndroid\/(\d+)\.(\d+)\.(\d+)/);
  var APP_VERSION_CODE = 0;
  if (matchUA) {
    APP_VERSION_CODE = parseInt(matchUA[1], 10) * 10000 + parseInt(matchUA[2], 10) * 100 + parseInt(matchUA[3], 10);
  }
  function showUpdateBanner(update) {
    var existing = document.getElementById('updateBanner');
    if (existing) existing.remove();
    var banner = document.createElement('div');
    banner.id = 'updateBanner';
    banner.style.cssText = 'position:fixed;bottom:80px;right:20px;max-width:360px;background:var(--card-bg);border:1px solid var(--border);border-left:4px solid #2563eb;border-radius:10px;padding:16px;box-shadow:0 4px 20px rgba(0,0,0,.12);z-index:99990;font-size:13px;line-height:1.6;animation:slideInRight .3s ease';
    var changelogHtml = update.changelog ? '<div style="margin:8px 0;padding:8px 12px;background:var(--hover-bg);border-radius:6px;font-size:12px;color:var(--text-light);white-space:pre-line">' + escapeHtml(update.changelog) + '</div>' : '';
    banner.innerHTML = '<div style="display:flex;align-items:flex-start;gap:10px"><span style="font-size:20px;flex-shrink:0">📦</span><div style="flex:1"><div style="font-weight:700;color:var(--text);margin-bottom:4px">新版本可用 v' + escapeHtml(update.latestVersionName) + '</div>' + changelogHtml + '<div style="display:flex;gap:8px;margin-top:6px"><a href="' + escapeHtml(update.apkUrl) + '" class="download-btn-sm" style="display:inline-block;padding:6px 14px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600">下载更新</a><button onclick="this.closest(\'#updateBanner\').remove()" style="background:none;border:none;color:#aaa;cursor:pointer;font-size:12px;padding:6px 10px">稍后</button></div></div><button onclick="this.closest(\'#updateBanner\').remove()" style="background:none;border:none;color:#aaa;cursor:pointer;font-size:16px;padding:0 0 0 8px;flex-shrink:0">✕</button></div>';
    if (!document.getElementById('slideInRightStyle')){
      var s=document.createElement('style');s.id='slideInRightStyle';s.textContent='@keyframes slideInRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}';document.head.appendChild(s);
    }
    document.documentElement.appendChild(banner);
  }
  function checkUpdate() {
    if (APP_VERSION_CODE < 1) return;
    var checked = sessionStorage.getItem('miltest_update_checked');
    if (checked) return;
    sessionStorage.setItem('miltest_update_checked', '1');
    fetch('/api/app/check-update?current=' + APP_VERSION_CODE)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success && data.update && data.update.hasUpdate) {
          setTimeout(function() { showUpdateBanner(data.update); }, 3000);
        }
      })
      .catch(function() {});
  }
  if (document.readyState === 'complete') {
    checkUpdate();
  } else {
    window.addEventListener('load', checkUpdate);
  }
})();
window.showToast = window.showToast || function(msg, type, duration) { UiKit.toast(msg, type, duration); };
// 移动端输入框聚焦时自动滚动到可视区域，防键盘遮挡
(function(){
  var ticking = false;
  document.addEventListener('focusin', function(e) {
    var tag = e.target && e.target.tagName;
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && window.innerWidth < 768) {
      if (!ticking) {
        ticking = true;
        setTimeout(function() {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          ticking = false;
        }, 350);
      }
    }
  });
})();
window.androidDownload = window.androidDownload || function(url, filename) {
  if (window.AndroidDownloader) {
    try {
      window.AndroidDownloader.download(url, filename);
      showToast('⏳ 开始下载 ' + filename, 'success', 3000);
    } catch(e) {}
    setTimeout(function() {
      if (!window._dlToastShown) {
        window._dlToastShown = true;
        showToast('如果下载未开始，请复制链接到浏览器下载', 'warning', 6000);
      }
    }, 3000);
  } else {
    window.open(url, '_blank');
  }
};
window.showDownloadApp = window.showDownloadApp || function() {
  var ua = navigator.userAgent;
  var isWechat = /MicroMessenger/i.test(ua);
  var isIOS = /iphone|ipad|ipod/i.test(ua);
  if (isWechat) {
    var wxHtml = '<div style="text-align:center;padding:10px 0"><div style="font-size:56px;margin-bottom:16px">📲</div><h3 style="margin:0 0 8px;font-size:18px">请在浏览器中打开</h3><p style="font-size:14px;color:var(--text-light);line-height:1.8;margin:0">微信内无法下载安装包<br>请点击右上角 <strong>···</strong> → 选择「在浏览器中打开」</p></div>';
    if (window.Modal && Modal.open) {
      Modal.open({ id:'downloadAppModal', title:'📥 下载客户端', size:'sm', html: wxHtml });
    } else {
      var wxBox = document.createElement('div');
      wxBox.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:100010';
      wxBox.addEventListener('click', function(e) { if (e.target === wxBox) wxBox.remove(); });
      var wxInner = document.createElement('div');
      wxInner.style.cssText = 'background:var(--card-bg,#fff);border-radius:16px;padding:24px;max-width:360px;width:90%;box-shadow:0 8px 40px rgba(0,0,0,.3)';
      wxInner.innerHTML = '<div style="text-align:right"><span id="wxDlClose" style="cursor:pointer;font-size:24px;color:var(--text-lighter,#999)">&times;</span></div>' + wxHtml;
      wxInner.querySelector('#wxDlClose').addEventListener('click', function() { wxBox.remove(); });
      wxBox.appendChild(wxInner);
      document.documentElement.appendChild(wxBox);
    }
    return;
  }
  var bodyHtml = '';
  if (isIOS) {
    bodyHtml = '<div style="text-align:center;padding:10px 0"><div style="font-size:56px;margin-bottom:16px">🍎</div><h3 style="margin:0 0 8px;font-size:18px">iOS 用户请使用 Safari</h3><p style="font-size:14px;color:var(--text-light);line-height:1.8;margin:0">点击底部分享按钮 <strong>⎋</strong><br>→ 选择「添加到主屏幕」<br>即可像 App 一样使用</p></div>';
  } else {
    bodyHtml = '<div style="text-align:center"><div style="font-size:48px;margin-bottom:12px">📦</div><h3 style="margin:0 0 6px;font-size:18px">下载五维测评系统</h3><p style="font-size:13px;color:var(--text-light);margin:0 0 20px;line-height:1.6">Windows 电脑和 Android 手机均可使用，数据与网页互通。</p></div>'
     + '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">'
      + '<a href="/api/download/win-setup" target="_blank" rel="noopener" onclick="showToast(\'⏳ 正在下载安装版...\',\'success\',3000)" style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:linear-gradient(135deg,#1E3A8A,#0F172A);color:#fff;border-radius:12px;text-decoration:none;font-size:14px;font-weight:600"><span style="font-size:24px;flex-shrink:0">🖥️</span><span style="flex:1">Windows 安装版</span><span style="font-size:12px;opacity:.7">78 MB</span></a>'
      + '<a href="/api/download/win-portable" target="_blank" rel="noopener" onclick="showToast(\'⏳ 正在下载便携版...\',\'success\',3000)" style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#1f2937;color:#fff;border-radius:12px;text-decoration:none;font-size:14px;font-weight:600"><span style="font-size:24px;flex-shrink:0">💻</span><span style="flex:1">Windows 便携版</span><span style="font-size:12px;opacity:.7">免安装</span></a>'
      + '<div onclick="event.preventDefault();window.androidDownload(\'/api/download/app-release\',\'wuweipingce.apk\')" style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#166534;color:#fff;border-radius:12px;text-decoration:none;font-size:14px;font-weight:600;cursor:pointer"><span style="font-size:24px;flex-shrink:0">📱</span><span style="flex:1">Android APK</span><span id="apkVersionBadge" style="font-size:12px;opacity:.7">...</span></div>'
      + (window.AndroidDownloader ? '<div style="text-align:center;margin-top:8px"><button onclick="var u=\'https://wuweisixing.cn/download\';navigator.clipboard.writeText(u);showToast(\'✅ 链接已复制，请在浏览器中打开\',\'success\')" style="background:none;border:1px solid var(--border);color:var(--text-light);border-radius:8px;padding:8px 16px;font-size:13px;cursor:pointer">📋 复制下载页链接</button><p style="font-size:12px;color:var(--text-light);margin:8px 0 0;line-height:1.5">如果下载未自动开始，请复制链接到浏览器中打开</p></div>' : '')
      + '</div>'
     + '<div style="text-align:center;border-top:1px solid var(--border);padding-top:14px;display:flex;flex-direction:column;gap:8px"><a href="/download" style="display:block;padding:12px;background:linear-gradient(135deg,#1E3A8A,#0F172A);color:#fff;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600">📲 下载 App →</a>'+(window._isAgentSite?('<a href="miltest://open?dl='+encodeURIComponent((new URLSearchParams(location.search).get('dl'))||'')+'" style="display:block;padding:12px;background:linear-gradient(135deg,#312E81,#0F172A);color:#fff;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600">📱 在 App 中打开</a>'):'')+'<p style="font-size:12px;color:var(--text-light);margin:0">iOS 用户请使用 Safari 浏览器访问本站，点击分享按钮 → 添加到主屏幕</p></div>';
  }
  if (window.Modal && Modal.open) {
    Modal.open({ id:'downloadAppModal', title:'📥 下载客户端', size:'sm', html: bodyHtml });
    fetch('/api/app/check-update').then(function(r){return r.json()}).then(function(d){
      if(d.success && d.update){
        var el=document.querySelector('#downloadAppModal #apkVersionBadge');
        if(el) el.textContent='v'+d.update.latestVersionName;
      }
    }).catch(function(){});
  } else {
  var ov = document.getElementById('dlFallbackOverlay');
      if (!ov) {
      ov = document.createElement('div');
      ov.id = 'dlFallbackOverlay';
      ov.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:100010';
      ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
      document.documentElement.appendChild(ov);
      var box = document.createElement('div');
      box.style.cssText = 'background:var(--card-bg,#fff);border-radius:16px;padding:24px;max-width:440px;width:92%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.3);position:relative';
      box.innerHTML = '<div style="display:flex;justify-content:flex-end"><button id="dlFallbackClose" style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--text-lighter,#999);padding:0 4px">&times;</button></div><div id="dlFallbackBody">' + bodyHtml + '</div>';
      ov.appendChild(box);
      document.getElementById('dlFallbackClose').addEventListener('click', function() { ov.remove(); });
    } else {
      document.getElementById('dlFallbackBody').innerHTML = bodyHtml;
    }
    var fallbackTimeout = null;
    var oldOvClick = ov.onclick;
    ov.addEventListener('click', function(e) {
      if (e.target === ov) { ov.remove(); }
    });
    fetch('/api/app/check-update').then(function(r){return r.json()}).then(function(d){
      if(d.success && d.update){
        var el=ov.querySelector('#apkVersionBadge');
        if(el) el.textContent='v'+d.update.latestVersionName;
      }
    }).catch(function(){});
  }
};

// 代理站功能屏蔽：隐藏下拉菜单中指定项
window._applyAgentFeatures = function() {
  if (!window._agentFeatures) return;
  document.querySelectorAll('.dropdown-item').forEach(function(el) {
    var href = el.getAttribute('href') || '';
    if (href === '/rank' && window._agentFeatures.show_rank === false) el.style.display = 'none';
  });
};

// 商城跳转统一入口：主站→自配商城(mall.html)，代理站→代理发卡商城，代理无商城→发卡兜底
window.ShopRoute = {
  mallUrl: function(key) { return '/mall.html' + (key ? '?p=' + encodeURIComponent(key) : ''); },
  agentUrl: function() { return window._agentShopUrl || ''; },
  cardUrl: function() { return 'https://hsfaka.cn/item/zy0bt8'; },
  buyUrl: function(key) {
    if (window._agentShopUrl) return window._agentShopUrl;
    if (window._agentFeatures) return 'https://hsfaka.cn/shop/wuweisixing.cn';
    return this.mallUrl(key || '30d');
  },
  pointsUrl: function() {
    if (window._agentShopUrl) return window._agentShopUrl;
    if (window._agentFeatures) return this.cardUrl();
    return this.mallUrl('points');
  }
};



