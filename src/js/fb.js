var fbOpen = false;
var fbUnreadTimer = null;

var escapeHtml = (window.Utils && window.Utils.escapeHtml) ? window.Utils.escapeHtml : function(t){if(!t)return'';return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')};
function toggleFB() {
 try {
  var m = document.getElementById('fbModal');
  if (!m) return;
  fbOpen = !fbOpen;
  if (fbOpen) {
   m.classList.add('open');
   loadFBFeedback();
   hideBadge();
  } else {
   m.classList.remove('open');
   if (window._fbMsgTimer) { clearInterval(window._fbMsgTimer); window._fbMsgTimer = null; }
  }
 } catch(e) { console.error('[fb]', e); }
}
function showBadge() {
 var b = document.querySelector('.fb-btn .fb-badge');
 if (b) b.style.display = 'block';
 var btn = document.getElementById('fbBtn');
 if (btn) btn.classList.add('fb-unread');
}
function hideBadge() {
 var b = document.querySelector('.fb-btn .fb-badge');
 if (b) b.style.display = 'none';
 var btn = document.getElementById('fbBtn');
 if (btn) btn.classList.remove('fb-unread');
}
function switchFBTab(tab, btn) {
 if (tab !== 'help' && window._fbMsgTimer) { clearInterval(window._fbMsgTimer); window._fbMsgTimer = null; }
 document.querySelectorAll('.fb-tab').forEach(function(t){ t.classList.remove('active'); });
 btn.classList.add('active');
 var allTabs = ['fbFeedback','fbHelp','fbAI'];
 allTabs.forEach(function(id){ var el = document.getElementById(id); if(el) el.classList.add('fb-hidden'); });
 var targetMap = {feedback:'fbFeedback',help:'fbHelp',ai:'fbAI'};
 var targetId = targetMap[tab];
 if (targetId) { var el = document.getElementById(targetId); if(el) el.classList.remove('fb-hidden'); }
 if (tab === 'feedback') loadFBFeedback();
 else if (tab === 'help') loadFBHelp();
 else if (tab === 'ai') loadAI();
}
function fbToken() { return localStorage.getItem('miltest_token'); }
function fbLoggedIn() { return !!fbToken(); }
function fbHeaders() {
 var h = { 'Content-Type': 'application/json' };
 var t = fbToken(); if (t) h['Authorization'] = 'Bearer ' + t;
 return h;
}
function fbLoginPrompt(msg) {
 return '<div class="fb-login-prompt"><p>' + msg + '</p><a class="fb-login-btn" href="/login">去登录</a></div>';
}

// ===== 虚拟自动回复（不写入系统聊天记录，仅前端展示） =====
var FB_QR_URL = '/assets/cs-group-qr.webp';
var FB_VIRTUAL_WELCOME_TEXT = '您好，欢迎来到在线客服。\n1一般使用登陆购买等问题可以往下滑找到新用户必看页学习一下，如果解决不了在问客服。\n2点击上方「微信客服群」链接，扫码加入群聊（二维码7天内有效，问完可退群）。\n3这里回复一般不及时，请前往微信客服群或商城（购买正式码的地方）找客服和联系商家。';
var FB_VIRTUAL_ACK_TEXT = '收到您的消息，我会尽快为您处理，请稍候...\n\n这里回复一般不及时，如需即时沟通请点击上方「微信客服群」链接扫码加入，或前往商城（购买正式码的地方）找客服和联系商家。';
var fbAutoAckConv = null;
var fbAutoReplyText = null;

function fbQrThumbHtml() {
 return '<div class="fb-msg-bubble fb-link-bubble"><a class="fb-qr-thumb" href="/wx-group.html" target="_blank" rel="noopener"><img class="fb-qr-img" src="' + FB_QR_URL + '" alt="微信客服群二维码" loading="lazy"><span class="fb-qr-caption">📱 微信客服群 · 点击查看大图加入</span></a></div>';
}
function fbVirtualWelcomeHtml() {
 return '<div class="fb-conv-msg admin">' + fbQrThumbHtml() + '<div class="fb-msg-time">客服</div></div>'
  + '<div class="fb-conv-msg admin"><div class="fb-msg-bubble">' + escapeHtml(FB_VIRTUAL_WELCOME_TEXT).replace(/\n/g,'<br>') + '</div><div class="fb-msg-time">客服</div></div>';
}
function fbVirtualAckHtml() {
 var t = fbAutoReplyText || FB_VIRTUAL_ACK_TEXT;
 return '<div class="fb-conv-msg admin"><div class="fb-msg-bubble">' + escapeHtml(t).replace(/\n/g,'<br>') + '</div><div class="fb-msg-time">客服</div></div>'
  + '<div class="fb-conv-msg admin">' + fbQrThumbHtml() + '<div class="fb-msg-time">客服</div></div>';
}

// ===== 确保 AI Tab 和 Content 存在 =====
function ensureAITab() {
 var modal = document.getElementById('fbModal');
 if (!modal) return;
 var tabs = modal.querySelector('.fb-tabs');
 if (tabs && !tabs.querySelector('[data-tab="ai"]')) {
  var btn = document.createElement('button');
  btn.className = 'fb-tab';
  btn.setAttribute('data-tab', 'ai');
  btn.setAttribute('onclick', "switchFBTab('ai',this)");
   btn.textContent = '\u{1F916} \u77E5\u8BC6\u5E93\u95EE\u7B54';
  tabs.appendChild(btn);
 }
 var body = modal.querySelector('.fb-body');
 if (body && !document.getElementById('fbAI')) {
  var div = document.createElement('div');
  div.id = 'fbAI';
  div.className = 'fb-hidden';
  div.innerHTML = '<div id="fbAIContent"></div>';
  body.appendChild(div);
 }
}

// ===== 后台轮询未读消息（基于后端已读标记，跨会话准确） =====
function checkUnreadMsgs() {
 if (fbOpen || !fbLoggedIn()) return;
 fetch('/api/conversations', { headers: fbHeaders() })
  .then(function(r){ return r.json(); })
  .then(function(data){
   var convs = data.conversations || [];
   var hasUnread = false;
   for (var i = 0; i < convs.length; i++) {
    if (convs[i].status === 'open' && convs[i].has_unread) { hasUnread = true; break; }
   }
   if (hasUnread) showBadge(); else hideBadge();
  })
  .catch(function(){});
}
function startUnreadPoll() {
 if (fbUnreadTimer) clearInterval(fbUnreadTimer);
 checkUnreadMsgs();
 fbUnreadTimer = setInterval(checkUnreadMsgs, 300000);
}

function loadFBFeedback() {
 var el = document.getElementById('fbFeedbackContent');
 if (!el) return;
 if (!fbLoggedIn()) { el.innerHTML = fbLoginPrompt('请登录后提交反馈'); return; }
 var html = '<p>遇到问题了？请描述您的反馈，我们会尽快处理。</p>'
  + '<textarea class="fb-textarea" id="fbMsgInput" placeholder="请详细描述您的问题或建议..."></textarea>'
  + '<button class="fb-submit" onclick="submitFB()">提交反馈</button>'
  + '<div style="clear:both"></div><div id="fbHistory"></div>';
 el.innerHTML = html;
 loadFBHistory();
}
function loadFBHistory() {
 var el = document.getElementById('fbHistory');
 if (!el) return;
 fetch('/api/feedback', { headers: fbHeaders() })
  .then(function(r){ return r.json(); })
  .then(function(data){
   if (!data.list || data.list.length === 0) { el.innerHTML = ''; return; }
   var html = '<h4 style="margin-top:12px;font-size:13px;color:#666">我的反馈</h4>';
   data.list.slice(0,3).forEach(function(f){
    var sm = {pending:'待处理',resolved:'已回复',dismissed:'已关闭'};
     html += '<div class="fb-feedback-item">'
      + '<div class="fb-fb-text">' + escapeHtml((f.content||'').substring(0,50)) + '</div>'
      + '<div class="fb-fb-meta"><span class="fb-fb-status ' + escapeHtml(f.status) + '">' + (sm[f.status]||escapeHtml(f.status)) + '</span><span style="font-size:10px;color:#aaa">' + escapeHtml((f.created_at||'').substring(0,10)) + '</span></div>';
     if (f.admin_reply) html += '<div class="fb-fb-reply">管理员：' + escapeHtml(f.admin_reply) + '</div>';
    html += '</div>';
   });
   el.innerHTML = html;
  })
  .catch(function(){});
}
function submitFB() {
 var msg = document.getElementById('fbMsgInput').value.trim();
 if (!msg) { window.showToast && window.showToast('请输入反馈内容', 'error'); return; }
 var btn = document.querySelector('#fbFeedback .fb-submit');
 btn.disabled = true; btn.textContent = '提交中...';
 fetch('/api/feedback', { method:'POST', headers:fbHeaders(), body:JSON.stringify({content:msg}) })
  .then(function(r){ return r.json(); })
  .then(function(d){
    if (d.error) { window.showToast && window.showToast(d.error, 'error'); btn.disabled = false; btn.textContent = '提交反馈'; return; }
    document.getElementById('fbMsgInput').value = '';
    window.showToast && window.showToast('反馈提交成功', 'success');
    btn.disabled = false; btn.textContent = '提交反馈';
    loadFBHistory();
   })
   .catch(function(){
    window.showToast && window.showToast('提交失败，请稍后重试', 'error');
    btn.disabled = false; btn.textContent = '提交反馈';
  });
}
var fbConvId = null;
function loadFBHelp() {
 var el = document.getElementById('fbHelpContent');
 if (!el) return;
 if (!fbLoggedIn()) { el.innerHTML = fbLoginPrompt('请登录后联系在线客服'); return; }
 el.innerHTML = '<div class="fb-loading">连接中...</div>';
 fbConvId = null;
 fetch('/api/conversations', { headers: fbHeaders() })
  .then(function(r){ return r.json(); })
  .then(function(data){
   var openConv = null;
   if (data.conversations) {
    for (var i=0; i<data.conversations.length; i++) {
     if (data.conversations[i].status === 'open') { openConv = data.conversations[i]; break; }
    }
   }
   if (openConv) { fbConvId = openConv.id; renderFBHelp(); return null; }
   return fetch('/api/conversations', { method:'POST', headers:fbHeaders(), body:'{}' }).then(function(r){ return r.json(); });
  })
  .then(function(d){
   if (d && d.conversation && !fbConvId) { fbConvId = d.conversation.id; renderFBHelp(); }
   else if (d === null) {}
   else if (!fbConvId) { document.getElementById('fbHelpContent').innerHTML = '<div class="fb-empty">无法创建对话，请稍后重试</div>'; }
  })
  .catch(function(){ document.getElementById('fbHelpContent').innerHTML = '<div class="fb-empty">连接失败，请稍后重试</div>'; });
}
function renderFBHelp() {
 var el = document.getElementById('fbHelpContent');
 if (!fbConvId) { el.innerHTML = '<div class="fb-empty">无法创建对话</div>'; return; }
 sessionStorage.setItem('fb_last_conv_id', fbConvId);
   el.innerHTML = '<div class="fb-conv-area" id="fbConvArea"><div class="fb-loading">加载消息...</div></div>'
    + '<div class="fb-conv-input">'
    + '<button type="button" class="fb-refresh-btn" id="fbRefreshBtn" title="刷新消息" onclick="loadFBMsgs()">↻</button>'
    + '<input type="text" id="fbConvInput" placeholder="输入消息..." onkeydown="if(event.key===\'Enter\')sendFBMsg()">'
    + '<button id="fbSendBtn" onclick="sendFBMsg()">发送</button>'
    + '</div>';
 loadFBMsgs();
 if (window._fbMsgTimer) { clearInterval(window._fbMsgTimer); window._fbMsgTimer = null; }
}
function loadFBMsgs() {
 if (!fbConvId) return;
 Promise.all([
  fetch('/api/conversations/config?_t=' + Date.now()).then(function(r){ return r.json(); }).catch(function(){ return {}; }),
  fetch('/api/conversations/' + fbConvId + '/messages', { headers: fbHeaders() }).then(function(r){ return r.json(); }).catch(function(){ return {}; })
 ])
  .then(function(res){
   var cfg = res[0] || {};
   var data = res[1] || {};
   if (cfg.qrUrl) FB_QR_URL = cfg.qrUrl;
   var area = document.getElementById('fbConvArea');
   if (!area) return;
   var wasAtBottom = (area.scrollHeight - area.scrollTop - area.clientHeight) < 60;
   var html = fbVirtualWelcomeHtml();
   var lastId = 0;
   var hasAdmin = false;
   (data.messages || []).forEach(function(m){
    var role = m.sender_role === 'admin' ? 'admin' : 'user';
    if (m.sender_role === 'admin') hasAdmin = true;
    var time = m.created_at ? chinatime(m.created_at).slice(-5) : '';
    html += '<div class="fb-conv-msg ' + role + '">'
     + '<div class="fb-msg-bubble">' + escapeHtml(m.content) + '</div>'
     + '<div class="fb-msg-time">' + time + '</div>'
     + '</div>';
    if (m.id > lastId) lastId = m.id;
   });
   if (hasAdmin) fbAutoAckConv = null;
   else if (fbAutoAckConv === fbConvId) html += fbVirtualAckHtml();
   sessionStorage.setItem('fb_last_msg_id', String(lastId));
   hideBadge();
   area.innerHTML = html;
   if (wasAtBottom) area.scrollTop = area.scrollHeight;
   try { fetch('/api/conversations/' + fbConvId + '/read', { method:'POST', headers:fbHeaders(), body:'{}' }).catch(function(){}); } catch(e) {}
  })
  .catch(function(){});
}
function sendFBMsg() {
 var input = document.getElementById('fbConvInput');
 var msg = input.value.trim();
 if (!msg || !fbConvId) return;
 input.disabled = true;
 document.getElementById('fbSendBtn').disabled = true;
 fetch('/api/conversations/' + fbConvId + '/messages', { method:'POST', headers:fbHeaders(), body:JSON.stringify({content:msg}) })
  .then(function(r){ return r.json(); })
  .then(function(d){
   input.value = '';
   input.disabled = false;
   document.getElementById('fbSendBtn').disabled = false;
   input.focus();
   if (d && d.autoReply) {
    fbAutoAckConv = fbConvId;
    fbAutoReplyText = (d.replyText && d.replyText.length) ? d.replyText : FB_VIRTUAL_ACK_TEXT;
   } else {
    fbAutoAckConv = null;
    fbAutoReplyText = null;
   }
   loadFBMsgs();
  })
  .catch(function(){
   input.disabled = false;
   document.getElementById('fbSendBtn').disabled = false;
    window.showToast && window.showToast('发送失败', 'error');
  });
}

// ===== AI 聊天（最新AI大模型） =====
var AI_USERID_KEY = 'sizhi_uid';
var AI_MSGS_KEY = 'sizhi_msgs';
var aiLoading = false;

function getAIUserId() {
 var uid = localStorage.getItem(AI_USERID_KEY);
 if (!uid) {
  uid = 'u_' + Date.now().toString(36) + Math.random().toString(36).substr(2,4);
  localStorage.setItem(AI_USERID_KEY, uid);
 }
 return uid;
}

 function loadAI() {
  var el = document.getElementById('fbAIContent');
  if (!el) return;
  var saved = localStorage.getItem(AI_MSGS_KEY);
  var msgs = [];
  try { msgs = saved ? JSON.parse(saved) : []; } catch (e) { msgs = []; }
  var html = '<div class="fb-conv-area" id="aiConvArea">';
  if (msgs.length === 0) {
   html += '<div class="fb-ai-msg ai"><div class="fb-msg-bubble">\u{1F44B} \u4F60\u597D\uFF01\u6211\u662F\u6839\u636E\u7BA1\u7406\u5458\u7ED9\u6211\u7684\u77E5\u8BC6\u5E93\u6765\u56DE\u7B54\u4F60\u7684\u95EE\u9898\uFF0C\u6709\u4EC0\u4E48\u60F3\u95EE\u7684\u5417\uFF1F</div></div>';
  } else {
   for (var i = 0; i < msgs.length; i++) {
    var role = msgs[i] && msgs[i].role === 'ai' ? 'ai' : 'user';
    html += '<div class="fb-ai-msg ' + role + '"><div class="fb-msg-bubble">' + escapeHtml(msgs[i] ? msgs[i].text : '') + '</div></div>';
   }
  }
 html += '</div>';
 html += '<div class="fb-ai-clear" onclick="clearAIChat()">\u{1F5D1}\uFE0F \u6E05\u9664\u5BF9\u8BDD</div>';
 html += '<div class="fb-conv-input"><input type="text" id="aiInput" placeholder="\u8F93\u5165\u4F60\u7684\u95EE\u9898..." onkeydown="if(event.key===\'Enter\')sendAI()"><button id="aiSendBtn" onclick="sendAI()">\u53D1\u9001</button></div>';
 el.innerHTML = html;
 var area = document.getElementById('aiConvArea');
 if (area) area.scrollTop = area.scrollHeight;
}

function sendAI() {
 if (aiLoading) return;
 var input = document.getElementById('aiInput');
 var text = input.value.trim();
 if (!text) return;
 var area = document.getElementById('aiConvArea');
 area.innerHTML += '<div class="fb-ai-msg user"><div class="fb-msg-bubble">' + escapeHtml(text) + '</div></div><div class="fb-ai-msg ai" id="aiLoading"><div class="fb-msg-bubble">\u{1F914} \u601D\u8003\u4E2D...</div></div>';
 area.scrollTop = area.scrollHeight;
 input.value = '';
 aiLoading = true;
 document.getElementById('aiSendBtn').disabled = true;
 input.disabled = true;
 var saved = localStorage.getItem(AI_MSGS_KEY);
 var msgs = [];
 try { msgs = saved ? JSON.parse(saved) : []; } catch (e) { msgs = []; }
 msgs.push({role: 'user', text});
  fetch('/api/ai/chat?spoken=' + encodeURIComponent(text) + '&userid=' + getAIUserId(), { headers: (function(){ var h = {}; var t = fbToken(); if (t) h['Authorization'] = 'Bearer ' + t; return h; })() })
  .then(function(r) { return r.json(); })
  .then(function(data) {
   var loading = document.getElementById('aiLoading');
   if (loading) loading.remove();
   var reply = '';
   if (data.status === 0 && data.data && data.data.info && data.data.info.text) {
    reply = data.data.info.text;
   } else {
    reply = '\u62B1\u6B49\uFF0C\u6211\u6CA1\u6709\u7406\u89E3\u4F60\u7684\u95EE\u9898\uFF0C\u8BF7\u91CD\u65B0\u63CF\u8FF0\u4E00\u4E0B\u3002';
   }
   area.innerHTML += '<div class="fb-ai-msg ai"><div class="fb-msg-bubble">' + escapeHtml(reply) + '</div></div>';
   area.scrollTop = area.scrollHeight;
   msgs.push({role: 'ai', text: reply});
   localStorage.setItem(AI_MSGS_KEY, JSON.stringify(msgs));
  })
  .catch(function() {
   var loading = document.getElementById('aiLoading');
   if (loading) loading.remove();
   area.innerHTML += '<div class="fb-ai-msg ai"><div class="fb-msg-bubble">\u26A0\uFE0F \u7F51\u7EDC\u5F02\u5E38\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002</div></div>';
   area.scrollTop = area.scrollHeight;
  })
  .finally(function() {
   aiLoading = false;
   document.getElementById('aiSendBtn').disabled = false;
   var inp = document.getElementById('aiInput');
   inp.disabled = false;
   inp.focus();
  });
}

async function clearAIChat() {
 if (await UiKit.confirm('清除对话','确定清除对话记录？')) {
  localStorage.removeItem(AI_MSGS_KEY);
  loadAI();
 }
}

// ===== 初始化（等DOM就绪） =====
(function() {
  function initFB() {
    var page = (location.pathname.split('/').pop() || '').replace(/\.html$/i, '');
    var allowedPages = ['index', 'home', '', 'trial'];
    if (allowedPages.indexOf(page) === -1) {
      var w = document.getElementById('fbWrap');
      if (w) w.style.display = 'none';
      var m = document.getElementById('fbModal');
      if (m) m.style.display = 'none';
      return;
    }

    var wrap = document.getElementById('fbWrap');
    var btn = document.getElementById('fbBtn');
    if (!wrap || !btn) return;

    // 只强制关键定位，bottom/right 交由 CSS 处理（支持安全区 env() 与移动端断点）
    wrap.style.cssText = 'position:fixed;left:auto;top:auto;z-index:100050;display:block;';
    if (wrap.parentNode !== document.body) {
      document.body.appendChild(wrap);
    }

    hideBadge();
    ensureAITab();
    // 只绑定 click：触摸设备也会派发 click；同时绑 touchend 在部分 WebView 会双触发导致弹窗秒开秒关
    btn.addEventListener('click', function(e) { e.preventDefault(); toggleFB(); });

    if ('requestIdleCallback' in window) {
      requestIdleCallback(function(){ startUnreadPoll(); }, { timeout: 5000 });
    } else {
      setTimeout(function(){ startUnreadPoll(); }, 3000);
    }
    document.addEventListener('visibilitychange', function(){
      if (document.hidden) {
        if (fbUnreadTimer) { clearInterval(fbUnreadTimer); fbUnreadTimer = null; }
      } else {
        startUnreadPoll();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFB);
  } else {
    initFB();
  }
})();
