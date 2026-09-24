// ==========================================================
// 背题模式 — 前端共享模块
// 资格判定唯一来源在服务端 /api/study-mode，前端仅渲染 UI
// 能力清单 StudyMode.SUPPORTED 需与后端 registry.js TEST_REGISTRY.studyMode 保持一致
// ==========================================================
window.StudyMode = {
  SUPPORTED: [
    'test2', 'test3', 'test4', 'test5', 'test6', 'test7', 'test8',
    'test10', 'test11', 'test12', 'test13', 'test14',
    'cj-test', 'ww-test', 'rw-test', 'jx-test', 'picbank', 'yt-test'
  ],

  _status: null,

  isSupported: function(testId) {
    return this.SUPPORTED.indexOf(testId) >= 0;
  },

  // 服务端资格查询（内存缓存，页面生命周期内只请求一次）
  fetchStatus: function() {
    if (this._status) return Promise.resolve(this._status);
    var self = this;
    return ApiClient.get('/study-mode').then(function(data) {
      if (data && data.success) self._status = data;
      return self._status;
    }).catch(function() {
      return null;
    });
  },

  isEligible: function() {
    return this.fetchStatus().then(function(s) {
      return !!(s && s.eligible);
    });
  },

  getMode: function(testId) {
    try {
      return sessionStorage.getItem(testId + '_study_mode') === '1';
    } catch (e) { return false; }
  },

  setMode: function(testId, on) {
    try {
      if (on) sessionStorage.setItem(testId + '_study_mode', '1');
      else sessionStorage.removeItem(testId + '_study_mode');
    } catch (e) {}
  },

  // 在欢迎屏开始按钮前注入背题模式复选框（样式同 _timerToggle）
  injectToggle: function(welcomeEl, testId) {
    if (!welcomeEl || document.getElementById('_studyToggleWrapper')) return;
    if (!this.isSupported(testId)) return;
    var self = this;
    return this.isEligible().then(function(ok) {
      if (!ok) return;
      var btn = welcomeEl.querySelector('.welcome-btn') || welcomeEl.querySelector('.sj-btn-primary') || welcomeEl.querySelector('[id^="start"]') || welcomeEl.querySelector('#mse_welcome .mse-btn');
      if (!btn) return;
      var wrap = document.createElement('div');
      wrap.id = '_studyToggleWrapper';
      wrap.style.cssText = 'margin:14px 0;text-align:center';
      var checkedAttr = self.getMode(testId) ? ' checked' : '';
      wrap.innerHTML = '<label style="cursor:pointer;font-size:13px;color:var(--text-light);display:inline-flex;align-items:center;gap:6px"><input type="checkbox" id="_studyToggle"' + checkedAttr + ' style="width:16px;height:16px;cursor:pointer">📖 背题模式（选完立即显示答案和解析，不计算成绩，做完弹出完成小结）</label>';
      btn.parentNode.insertBefore(wrap, btn);
      var cb = document.getElementById('_studyToggle');
      if (cb) {
        cb.addEventListener('change', function() {
          self.setMode(testId, cb.checked);
          var timerToggle = document.getElementById('_timerToggle');
          if (cb.checked) {
            if (timerToggle) { timerToggle.checked = false; timerToggle.disabled = true; }
          } else {
            if (timerToggle) timerToggle.disabled = false;
          }
        });
        if (cb.checked) {
          var t = document.getElementById('_timerToggle');
          if (t) { t.checked = false; t.disabled = true; }
        }
      }
    });
  },

  // 对错 + 正确答案 + 解析 反馈块
  feedbackHtml: function(q, userAns) {
    if (!q) return '';
    var ans = q.ans;
    if (ans === undefined || ans === null) {
      return '<div class="study-feedback" style="margin-top:16px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;font-size:14px;color:#64748b">本题暂无标准答案</div>';
    }
    var correctArr = Array.isArray(ans) ? ans : [ans];
    var isCorrect = this.isCorrect(q, userAns);
    var labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    var opts = q.opts || [];
    var correctText = '';
    if (q.type === 'truefalse') {
      correctText = correctArr.map(function(v) { return (v === 1 || v === '错误') ? '错误' : '正确'; }).join(' / ');
    } else if (q.type === 'judge' || q.type === 'yesno' || (opts.length === 0 && q.type !== 'multi')) {
      // judge 题型约定：0=是，1=否（与 multi-section-engine 一致）
      correctText = correctArr.map(function(v) { return (v === 1 || v === '否') ? '否' : '是'; }).join(' / ');
    } else {
      correctText = correctArr.map(function(v) {
        if (typeof v === 'number' && opts[v] !== undefined) return labels[v] + '. ' + MathRender.render(opts[v]);
        return String(v);
      }).join(' / ');
    }
    var headColor = isCorrect ? '#22c55e' : '#ef4444';
    var headBg = isCorrect ? '#f0fdf4' : '#fef2f2';
    var html = '<div class="study-feedback" style="margin-top:16px;padding:14px 16px;background:' + headBg + ';border:1px solid ' + headColor + ';border-radius:12px;font-size:14px;line-height:1.7">';
    html += '<div style="font-weight:700;color:' + headColor + ';font-size:15px;margin-bottom:6px">' + (isCorrect ? '✅ 回答正确' : '❌ 回答错误') + '</div>';
    html += '<div style="color:#0F172A"><span style="color:#64748b">正确答案：</span><strong>' + correctText + '</strong></div>';
    if (q.explain) {
      html += '<div style="margin-top:8px;color:#475569"><span style="font-weight:600;color:#0F172A">💡 解析：</span>' + MathRender.render(q.explain) + '</div>';
    }
    html += '</div>';
    return html;
  },

  // 判断某题作答是否正确（与 feedbackHtml 判定一致）
  isCorrect: function(q, userAns) {
    if (!q) return false;
    var ans = q.ans;
    if (ans === undefined || ans === null) return false;
    var correctArr = Array.isArray(ans) ? ans : [ans];
    if (typeof userAns === 'number') return userAns >= 0 && correctArr.indexOf(userAns) >= 0;
    if (Array.isArray(userAns)) return userAns.length > 0 && correctArr.slice().sort().join(',') === userAns.slice().sort().join(',');
    if (typeof userAns === 'string') {
      // 论述/简答类：与标准答案做去空白宽松比较
      var t = String(userAns).trim();
      for (var ci = 0; ci < correctArr.length; ci++) {
        if (String(correctArr[ci]).trim() === t) return true;
      }
    }
    return false;
  },

  // 汇总本次背题作答情况（questions 支持 对象{idx:q} 或 数组）
  computeStats: function(questions, answers, total) {
    var stats = { total: total || 0, answered: 0, correct: 0, wrong: 0, skipped: 0, judged: 0 };
    if (!questions) return stats;
    for (var i = 0; i < stats.total; i++) {
      var q = questions[i];
      if (!q) { stats.skipped++; continue; }
      var a = answers ? answers[i] : undefined;
      var answeredFlag = Array.isArray(a) ? a.length > 0 : ((typeof a === 'number' && a >= 0) || (typeof a === 'string' && String(a).trim() !== ''));
      if (!answeredFlag) { stats.skipped++; continue; }
      stats.answered++;
      if (q.ans === undefined || q.ans === null) continue; // 无标准答案（如论述题），不计对错
      stats.judged++;
      if (this.isCorrect(q, a)) stats.correct++; else stats.wrong++;
    }
    return stats;
  },

  // 背题完成小结（替代原来的 toast，作为背题模式的“结果页”）
  showSummary: function(stats) {
    stats = stats || {};
    var total = stats.total || 0;
    var answered = stats.answered || 0;
    var correct = stats.correct || 0;
    var wrong = stats.wrong || 0;
    var skipped = stats.skipped || 0;
    var judged = stats.judged || 0;
    var pct = judged > 0 ? Math.round(correct / judged * 100) : null;
    var row = function(label, value, color) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 2px;font-size:13px">' +
        '<span style="color:#64748b">' + label + '</span>' +
        '<span style="font-weight:700;' + (color ? 'color:' + color + ';' : '') + '">' + value + '</span></div>';
    };
    var html = '<div style="text-align:center;padding:4px 2px">' +
      '<div style="font-size:42px;line-height:1">📖</div>' +
      '<div style="font-size:17px;font-weight:700;color:#0F172A;margin:10px 0 14px">背题完成！</div>' +
      '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 16px;margin-bottom:14px;text-align:left">' +
        row('本次浏览', total + ' 题') +
        row('已作答', answered + ' 题') +
        row('答对', correct + ' 题', '#22c55e') +
        row('答错', wrong + ' 题', '#ef4444') +
        (skipped > 0 ? row('未作答', skipped + ' 题', '#f59e0b') : '') +
        row('正确率', pct === null ? '—' : pct + '%', pct === null ? '#94a3b8' : (pct >= 60 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444')) +
      '</div>' +
      '<div style="color:#94a3b8;font-size:12px;line-height:1.7;margin-bottom:16px">背题模式不记录成绩，仅供记忆练习<br>再次进入会自动换一批随机题</div>' +
      '<button onclick="StudyMode.exitStudy()" style="min-height:44px;padding:0 44px;border-radius:10px;border:none;font-size:14px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#1B5E20,#2E7D32);color:#fff">返回开始</button>' +
    '</div>';
    if (window.Modal) Modal.open({ id: 'studyDone', title: '📖 背题完成', html: html, size: 'sm' });
    else if (window.showToast) showToast('背题完成！','success');
  },

  // 生成一段新的随机题序（用于背题完成后换一批题）
  genIndices: function(bank, total) {
    bank = bank || 0; total = total || 0;
    if (!bank || !total || bank < total) return null;
    var all = [];
    for (var i = 0; i < bank; i++) all.push(i);
    for (var j = all.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var t = all[j]; all[j] = all[k]; all[k] = t;
    }
    return all.slice(0, total);
  },

  // 页面需在 init 时记录 window._studyBankSize / window._studyTotal，供换题使用
  reshuffleIndices: function() {
    return this.genIndices(window._studyBankSize || 0, window._studyTotal || 0);
  },

  // 测验关闭提示（渲染到欢迎屏）
  renderClosed: function(el) {
    if (!el) return;
    el.innerHTML = '<div style="padding:40px 20px;text-align:center;max-width:520px;margin:0 auto"><div style="font-size:44px;margin-bottom:10px">🔧</div><div style="font-size:19px;font-weight:700;color:#0F172A">该题库正在更新或维护中</div><div style="font-size:14px;color:var(--text-light);margin-top:12px;line-height:1.9">本题库正在进行内容更新或系统维护，暂时无法进入做题。<br>为保障测评的准确性与使用体验，题库升级完成后会自动恢复开放，届时即可正常使用。<br>您可以稍后再来，或先前往测评中心体验其他已开放的测评项目。</div><div style="font-size:13px;color:#94A3B8;margin-top:14px">给您带来不便，敬请谅解</div><div style="margin-top:20px"><a href="/index" style="display:inline-block;padding:11px 34px;background:linear-gradient(135deg,#3B82F6,#1E40AF);color:#fff;border-radius:24px;font-size:14px;font-weight:700;text-decoration:none">返回测评中心</a></div></div>';
  },

  // 背题结束：返回开始页（由引擎 finishStudy 调用）
  exitStudy: function() {
    if (window.Modal) Modal.closeAll();
  }
};
