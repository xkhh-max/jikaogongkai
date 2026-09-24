// ===== 测验引擎 =====
window.ExamEngine = {
  create: function(config) {
    var engine = {
      testId: config.testId,
      timePerQuestion: config.timePerQuestion || 0,
      useTimer: config.timerDefault === true,
      total: config.total || 60,
      maxTotal: config.total || 60,
      questionFormat: config.questionFormat || 'choice',
      answerInit: config.answerInit !== undefined ? config.answerInit : -1,
      bankFallback: config.bankFallback || config.total || 60,
      storagePrefix: config.testId + '_',
      studyMode: false,

      questions: {},
      questionIndices: [],
      answers: [],
      currentQ: 0,
      timerId: null,
      timeLeft: 0,
      timeoutCount: 0,
      isAnswered: false,
      startTime: null,
      elapsedTimerId: null,
      _autoAdvanceTimer: null,
      initReady: false,
      _submitting: false,
      resultData: null,

      _tips: [
        '\uD83D\uDCAA \u575A\u6301\u5C31\u662F\u80DC\u5229\uFF01',
        '\uD83C\uDFAF \u4E13\u6CE8\u5F53\u4E0B\u8FD9\u4E00\u9898',
        '\u26A1 \u4F60\u7684\u901F\u5EA6\u5F88\u5FEB\uFF01',
        '\uD83E\uDDE0 \u4FDD\u6301\u51B7\u9759\uFF0C\u4F60\u505A\u5F97\u5F88\u68D2',
        '\uD83C\uDF1F \u6BCF\u4E00\u9898\u90FD\u5728\u8BA9\u4F60\u53D8\u5F97\u66F4\u5F3A',
        '\uD83D\uDD25 \u7EE7\u7EED\u4FDD\u6301\u8FD9\u4E2A\u8282\u594F\uFF01',
        '\uD83D\uDCAB \u76F8\u4FE1\u81EA\u5DF1\u7684\u5224\u65AD',
        '\uD83C\uDFC6 \u80DC\u5229\u5C31\u5728\u524D\u65B9'
      ],

      _shuffle: function(arr) {
        if (window.Utils && window.Utils.shuffle) return Utils.shuffle(arr);
        for (var i = arr.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        }
        return arr;
      },

      init: async function() {
        var self = this;
        try {
          var infoData = await ApiClient.get('/questions/info');
          if (infoData && infoData.success && infoData.data) {
            var closedList = infoData.data.closed || [];
            if (closedList.indexOf(self.testId) >= 0) {
              if (window.StudyMode) StudyMode.renderClosed(document.getElementById('welcomeScreen'));
              return;
            }
            var bankSize = infoData.data[self.testId] || self.bankFallback;
            self.bankSize = bankSize;
            self.maxTotal = Math.max(self.total, self.maxTotal || 0);
            if (bankSize < self.total) { self.total = bankSize; }
            var allIdx = [];
            for (var i = 0; i < bankSize; i++) allIdx.push(i);
            self._shuffle(allIdx);
            if (self.answers.length === 0) {
              self.questionIndices = allIdx.slice(0, self.total);
              self._initAnswers();
            }
            self.initReady = true;
            self._updateTotalLabel();
            self._injectTimerToggle();
            if (window.StudyMode && StudyMode.isSupported(self.testId)) {
              self._injectStudyToggle();
            }
            return;
          }
        } catch (e) { console.error('init error:', e); }
        var allIdx = [];
        for (var i = 0; i < self.bankFallback; i++) allIdx.push(i);
        self._shuffle(allIdx);
        if (self.answers.length === 0) {
          self.questionIndices = allIdx.slice(0, self.total);
          self._initAnswers();
        }
        self.initReady = true;
        self._updateTotalLabel();
      },

      _initAnswers: function() {
        if (this.answerInit === -1) {
          this.answers = new Array(this.total).fill(-1);
        } else {
          this.answers = new Array(this.total);
        }
      },

      _updateTotalLabel: function() {
        var el = document.getElementById('totalLabel');
        if (el) el.textContent = this.total;
      },

      startTest: async function() {
        var self = this;
        if (!Auth.isLoggedIn()) {
          location.href = '/login?redirect=/' + self.testId;
          return;
        }
        var cu = Auth.getCurrentUser();
        if (cu && cu.account_type === 'trial' && config.requireFormal !== false) {
          location.href = '/upgrade?redirect=/' + self.testId;
          return;
        }
        var welcome = document.getElementById('welcomeScreen');
        var test = document.getElementById('testScreen');
        if (welcome) welcome.style.display = 'none';
        if (test) test.style.display = 'block';
        var toggle = document.getElementById('_timerToggle');
        if (toggle) self.useTimer = toggle.checked;
        var studyToggle = document.getElementById('_studyToggle');
        if (studyToggle) {
          self.studyMode = studyToggle.checked;
          StudyMode.setMode(self.testId, studyToggle.checked);
          if (self.studyMode) self.useTimer = false;
        } else {
          self.studyMode = false;
        }
        await self._restoreProgress();
        self.startTime = Date.now();
        self.elapsedTimerId = setInterval(function() { self._updateElapsedTime(); }, 1000);
        if (self.currentQ === undefined || self.currentQ < 0) self.currentQ = 0;
        if (window.AndroidKeepScreenOn) window.AndroidKeepScreenOn.enable();
        self.renderQuestion();
      },

      _injectTimerToggle: function() {
        var ws = document.getElementById('welcomeScreen');
        if (!ws || document.getElementById('_timerToggleWrapper')) return;
        var btn = ws.querySelector('.welcome-btn');
        if (!btn) return;
        var wrap = document.createElement('div');
        wrap.id = '_timerToggleWrapper';
        wrap.style.cssText = 'margin:14px 0;text-align:center';
        var checkedAttr = this.useTimer ? ' checked' : '';
        wrap.innerHTML = '<label style="cursor:pointer;font-size:13px;color:var(--text-light);display:inline-flex;align-items:center;gap:6px"><input type="checkbox" id="_timerToggle"' + checkedAttr + ' style="width:16px;height:16px;cursor:pointer">⏱ 启用倒计时（每题限时'+this.timePerQuestion+'秒，超时自动跳转）</label>';
        ws.insertBefore(wrap, btn);
      },

      _injectStudyToggle: function() {
        var ws = document.getElementById('welcomeScreen');
        if (!ws || document.getElementById('_studyToggleWrapper')) return;
        StudyMode.injectToggle(ws, this.testId);
      },

      _progPrefix: function() {
        return this.studyMode ? this.testId + '_study_' : this.storagePrefix;
      },

      _restoreProgress: async function() {
        try {
          var pre = this._progPrefix();
          var saved = sessionStorage.getItem(pre + 'answers');
          var savedIdx = sessionStorage.getItem(pre + 'indices');
          var lsSaved, lsSavedIdx;
          if ((!saved || !savedIdx) && this.total > 30) {
            lsSaved = localStorage.getItem(pre + 'answers');
            lsSavedIdx = localStorage.getItem(pre + 'indices');
            saved = saved || lsSaved;
            savedIdx = savedIdx || lsSavedIdx;
          }
          if (saved && savedIdx) {
            if (lsSaved && lsSavedIdx) {
              if (!await UiKit.confirm('提示','检测到上次未完成的测验，是否继续？',{okText:'继续',cancelText:'重新开始'})) {
                localStorage.removeItem(pre + 'answers');
                localStorage.removeItem(pre + 'indices');
                sessionStorage.removeItem(pre + 'answers');
                sessionStorage.removeItem(pre + 'indices');
                return;
              }
            }
            var sa = JSON.parse(saved), si = JSON.parse(savedIdx);
            if (sa.length === this.total && si.length === this.total) {
              this.answers = sa;
              this.questionIndices = si;
              if (this.questionFormat === 'likert') {
                this.currentQ = this.answers.findIndex(function(a) { return a === undefined || a === null; });
              } else if (this.answerInit === -1) {
                this.currentQ = this.answers.findIndex(function(a) { return a === -1; });
              } else {
                this.currentQ = this.answers.findIndex(function(a) { return a === undefined; });
              }
              if (this.currentQ < 0) { this.currentQ = this.total - 1; }
            }
          }
        } catch (e) { /* ignore */ }
      },

      _saveProgress: function() {
        try {
          var pre = this._progPrefix();
          var data = JSON.stringify(this.answers);
          var indices = JSON.stringify(this.questionIndices);
          sessionStorage.setItem(pre + 'answers', data);
          sessionStorage.setItem(pre + 'indices', indices);
          if (this.total > 30) {
            localStorage.setItem(pre + 'answers', data);
            localStorage.setItem(pre + 'indices', indices);
          }
        } catch (e) { /* ignore */ }
      },

      _clearProgress: function() {
        try {
          var pre = this._progPrefix();
          sessionStorage.removeItem(pre + 'answers');
          sessionStorage.removeItem(pre + 'indices');
          localStorage.removeItem(pre + 'answers');
          localStorage.removeItem(pre + 'indices');
          if (this.questionFormat === 'yesno') {
            for (var i = 0; i < this.total; i++) sessionStorage.removeItem(pre + 'q_' + i);
          }
        } catch (e) { /* ignore */ }
      },

      _pendingLoads: {},

      loadQuestion: async function(idx) {
        var self = this;
        if (self.questions[idx]) return self.questions[idx];
        if (self._pendingLoads[idx]) return self._pendingLoads[idx];
        self._pendingLoads[idx] = self._doLoadQuestion(idx);
        return self._pendingLoads[idx];
      },

      _batchLoaded: false,

      _doLoadQuestion: async function(idx) {
        var self = this;
        if (self.questionFormat === 'yesno') {
          try {
            var cached = sessionStorage.getItem(self.storagePrefix + 'q_' + idx);
            if (cached) { var parsed = JSON.parse(cached); if (parsed && parsed.q) { self.questions[idx] = parsed.q; return parsed.q; } }
          } catch (e) { /* ignore */ }
        }
        var apiIdx = self.questionIndices[idx];

        if (apiIdx === undefined) return null;
        if (!Auth.isLoggedIn()) { location.href = '/login?redirect=/' + self.testId; return null; }
        if (self.testId === 'test1' && !self._batchLoaded) {
          try {
            var batchData = await ApiClient.get('/questions/' + self.testId + '/batch');
            if (batchData && batchData.success && batchData.data && batchData.data.questions) {
              var allQ = batchData.data.questions;
              for (var qi = 0; qi < allQ.length; qi++) {
                var realIdx = self.questionIndices.indexOf(qi);
                if (realIdx !== -1) {
                  self.questions[realIdx] = allQ[qi];
                }
              }
              self._batchLoaded = true;
              if (self.questions[idx]) { delete self._pendingLoads[idx]; return self.questions[idx]; }
            }
          } catch (e) { /* batch fail, fall through to individual */ }
        }
        if (self.questions[idx]) { delete self._pendingLoads[idx]; return self.questions[idx]; }
        for (var retry = 0; ; retry++) {
          var delay = retry === 0 ? 0 : Math.min(1000 * Math.pow(2, retry - 1), 8000);
          delay = delay + Math.floor(Math.random() * 500);
          try {
            if (delay) await new Promise(function(r) { setTimeout(r, delay); });
            var qUrl = '/questions/' + self.testId + '?idx=' + apiIdx;
            if (self.studyMode) qUrl += '&mode=study';
            var data = await ApiClient.get(qUrl);
            if (data.success) {
              self.questions[idx] = data.data.question;
              delete self._pendingLoads[idx];
              if (self.questionFormat === 'yesno') {
                try { sessionStorage.setItem(self.storagePrefix + 'q_' + idx, JSON.stringify({ q: data.data.question, t: Date.now() })); } catch (e) { /* ignore */ }
              }
              return data.data.question;
            }
          } catch (e) { console.error('loadQuestion error (attempt ' + (retry + 1) + '):', e); }
          if (retry >= 6) {
            delete self._pendingLoads[idx];
            var qText = document.getElementById('qText');
            if (qText) qText.innerHTML = '\u52A0\u8F7D\u5931\u8D25\uFF0C<a href="#" onclick="engine.retryLoad(' + idx + ');return false">\u70B9\u51FB\u91CD\u8BD5</a>';

            return null;
          }
        }
      },

      retryLoad: function(idx) {
        if (!this._retryCount) this._retryCount = {};
        this._retryCount[idx] = (this._retryCount[idx] || 0) + 1;
        if (this._retryCount[idx] > 3) {
          document.getElementById('qText').textContent = '\u26A0\uFE0F \u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u540E\u91CD\u8BD5';
          return;
        }
        document.getElementById('qText').textContent = '\u52A0\u8F7D\u4E2D...';
        this.renderQuestion();
      },

_preloadFrom: function(idx) {
         var self = this;
         if (!self.initReady) return;
          for (var i = idx + 1; i <= idx + 3 && i < self.total; i++) {
           if (!self.questions[i]) { self.loadQuestion(i).catch(function() {}); }
}
        },

        renderQuestion: async function() {
        var self = this;
        if (!self.initReady) {
          var qText = document.getElementById('qText');
          if (qText) qText.innerHTML = '<span class="loading-dots">题目标题加载中<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span>';
          setTimeout(function() { self.renderQuestion(); }, 500);
          return;
        }
        var q = await self.loadQuestion(self.currentQ);
        if (!q) {
          var tip = (window.Utils && Utils.netTip) ? Utils.netTip() : '网络异常，请更换优质的网络环境后再试';
          var retryBtn = '<div class="load-error"><div style="margin-bottom:10px;font-size:13px;line-height:1.8">' + tip + '</div><a onclick="engine.retryLoad(' + self.currentQ + ')">重新加载</a></div>';
          var qText = document.getElementById('qText');
          if (qText) qText.innerHTML = retryBtn;
          return;
        }
        self._renderQNumber();
        self._renderQText(q);
        self._renderProgress();
        self._renderOptions(q);
        self._renderNavButtons();
        if (self.studyMode) {
          if (self._isAnswered(self.currentQ)) {
            self._renderStudyFeedback();
          } else {
            var sfEl = document.getElementById('studyFeedback');
            if (sfEl && sfEl.parentNode) sfEl.parentNode.removeChild(sfEl);
          }
        }
        if (self.questionFormat !== 'likert') {
          if (self.currentQ === self.total - 1 && self._isAnswered(self.currentQ)) {
            self._showSubmitIfReady();
          } else {
            var submitBtn = document.getElementById('submitBtn');
            if (submitBtn) submitBtn.style.display = 'none';
            self.isAnswered = false;
            if (!self.studyMode && self.timePerQuestion > 0 && self.useTimer) self._startTimer();
          }
        } else {
          if (self.currentQ === self.total - 1 && self._isAnswered(self.currentQ)) {
            self._showSubmitIfReady();
          } else {
            var submitBtn = document.getElementById('submitBtn');
            if (submitBtn) submitBtn.style.display = 'none';
          }
        }
        self._updateMotivation();
        self._preloadFrom(self.currentQ);
      },

      _isAnswered: function(idx) {
        if (this.answerInit === -1) return this.answers[idx] >= 0 || this.answers[idx] === -2;
        return this.answers[idx] !== undefined && this.answers[idx] !== null;
      },

      _renderQNumber: function() {
        var el = document.getElementById('qNumber');
        if (el) el.textContent = '\u7B2C ' + (this.currentQ + 1) + ' \u9898';
        var label = document.getElementById('qNumLabel');
        if (label) label.textContent = this.currentQ + 1;
        var typeEl = document.getElementById('qTypeLabel');
        if (typeEl) {
          var cq = this.questions && this.questions[this.currentQ];
          if (cq && cq.subtype) {
            typeEl.textContent = cq.subtype;
          } else {
            var typeMap = { yesno: '\u662F/\u5426', choice: '4\u90091', likert: '\u4E94\u7EA7\u8BC4\u5206' };
            typeEl.textContent = typeMap[this.questionFormat] || '';
          }
        }
      },

      _renderQText: function(q) {
        var el = document.getElementById('qText');
        if (!el) return;
        if (this.questionFormat === 'choice' && q && q.q) {
          el.textContent = q.q;
        } else {
          el.textContent = (typeof q === 'string') ? q : (q.q || q);
        }
      },

      _renderProgress: function() {
        var pct = ((this.currentQ + 1) / this.total * 100).toFixed(1);
        var fill = document.getElementById('progressFill');
        if (fill) fill.style.width = pct + '%';
        var label = document.getElementById('progressLabel');
        if (label) label.textContent = '\u7B2C ' + (this.currentQ + 1) + ' / ' + this.total + ' \u9898';
        var pctEl = document.getElementById('progressPct');
        if (pctEl) pctEl.textContent = pct + '%';
        var cnt = document.getElementById('answeredCount');
        if (cnt) {
          if (this.answerInit === -1) {
            cnt.textContent = this.answers.filter(function(a) { return a >= 0; }).length;
          } else {
            cnt.textContent = this.answers.filter(function(a) { return a !== undefined; }).length;
          }
        }
      },

      _renderOptions: function(q) {
        var opts = document.getElementById('qOptions');
        if (!opts) return;
        opts.innerHTML = '';
        var self = this;

        if (self.questionFormat === 'yesno') {
          var choices = [{ label: '\u662F', value: 1 }, { label: '\u5426', value: 0 }];
          choices.forEach(function(c) {
            var div = document.createElement('div');
            div.className = 'q-option' + (self.answers[self.currentQ] === c.value ? ' selected' : '');
            var radio = document.createElement('div'); radio.className = 'radio';
            var textSpan = document.createElement('span'); textSpan.style.fontSize = '16px'; textSpan.textContent = c.label;
            div.append(radio, textSpan);
            div.onclick = function() { self.selectAnswer(c.value); };
            opts.appendChild(div);
          });
        } else if (self.questionFormat === 'choice' && q && q.opts) {
          var labels = ['A', 'B', 'C', 'D'];
          q.opts.forEach(function(opt, i) {
            var div = document.createElement('div');
            div.className = 'q-option' + (self.answers[self.currentQ] === i ? ' selected' : '');
            var radio = document.createElement('div'); radio.className = 'radio';
            var labelSpan = document.createElement('span'); labelSpan.className = 'opt-label'; labelSpan.textContent = labels[i];
            var textSpan = document.createElement('span'); textSpan.textContent = opt;
            div.append(radio, labelSpan, textSpan);
            div.onclick = function() { self.selectAnswer(i); };
            opts.appendChild(div);
          });
        } else if (self.questionFormat === 'likert') {
          var levels = [
            { value: 1, label: '1 - \u65E0\u75C7\u72B6', color: '#27ae60' },
            { value: 2, label: '2 - \u8F7B\u5EA6', color: '#2ecc71' },
            { value: 3, label: '3 - \u4E2D\u5EA6', color: '#f39c12' },
            { value: 4, label: '4 - \u504F\u91CD', color: '#e67e22' },
            { value: 5, label: '5 - \u4E25\u91CD', color: '#e74c3c' }
          ];
          levels.forEach(function(l) {
            var div = document.createElement('div');
            div.className = 'scl-option' + (self.answers[self.currentQ] === l.value ? ' selected' : '');
            var radio = document.createElement('div'); radio.className = 'scl-radio';
            var label = document.createElement('span'); label.className = 'scl-label'; label.textContent = l.label;
            div.append(radio, label);
            div.onclick = function() { self.selectAnswer(l.value); };
            opts.appendChild(div);
          });
        }
      },

      _renderStudyFeedback: function() {
        var self = this;
        var q = self.questions[self.currentQ];
        if (!q) return;
        var opts = document.getElementById('qOptions');
        var existing = document.getElementById('studyFeedback');
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
        var div = document.createElement('div');
        div.id = 'studyFeedback';
        div.innerHTML = StudyMode.feedbackHtml(q, self.answers[self.currentQ]);
        if (opts && opts.parentNode) opts.parentNode.insertBefore(div, opts.nextSibling);
      },

      _renderNavButtons: function() {
        var prevBtn = document.getElementById('prevBtn');
        if (prevBtn) prevBtn.style.display = this.currentQ === 0 ? 'none' : 'inline-block';
        var nextBtn = document.getElementById('nextBtn');
        if (!nextBtn) return;
        if (this.studyMode) {
          nextBtn.style.display = (this.currentQ < this.total - 1 && this._isAnswered(this.currentQ)) ? 'inline-block' : 'none';
        } else {
          nextBtn.style.display = this.currentQ < this.total - 1 ? 'inline-block' : 'none';
        }
      },

      selectAnswer: function(val) {
        var self = this;
        if (self.studyMode && typeof self.answers[self.currentQ] === 'number' && self.answers[self.currentQ] >= 0) return;
        if (self.answers[self.currentQ] !== undefined && self.answers[self.currentQ] === val) return;
        if (self.questionFormat === 'likert') {
          self.answers[self.currentQ] = val;
          self.isAnswered = false;
          if (self.currentQ < self.total - 1) {
            setTimeout(function() { self.currentQ++; self.renderQuestion(); }, 200);
          } else {
            self._showSubmitIfReady();
          }
          return;
        }
        self.isAnswered = true;
        self.answers[self.currentQ] = val;
        self._saveProgress();
        self._preloadFrom(self.currentQ + 1);

        var opts = document.querySelectorAll('#qOptions .q-option, #qOptions .scl-option');
        if (self.questionFormat === 'yesno') {
          opts.forEach(function(el, i) {
            el.classList.toggle('selected', (i === 0 && val === 1) || (i === 1 && val === 0));
          });
        } else {
          opts.forEach(function(el, i) { el.classList.toggle('selected', i === val || (self.questionFormat === 'choice' && i === val)); });
        }

        if (self.questionFormat === 'likert') {
          self.isAnswered = false;
          if (self.currentQ < self.total - 1) {
            setTimeout(function() { self.currentQ++; self.renderQuestion(); }, 200);
          } else {
            self._showSubmitIfReady();
          }
          return;
        }

        if (self.studyMode) {
          self._renderStudyFeedback();
          self._renderNavButtons();
          if (self.currentQ === self.total - 1) self._showSubmitIfReady();
          return;
        }

        if (self.timePerQuestion > 0) clearInterval(self.timerId);
        if (self.useTimer) {
          self._autoAdvanceTimer = setTimeout(function() {
            self._autoAdvanceTimer = null;
            if (self.currentQ < self.total - 1) { self.currentQ++; self.renderQuestion(); }
            else self._showSubmitIfReady();
          }, 300);
        } else if (self.currentQ === self.total - 1) {
          self._showSubmitIfReady();
        }
      },

      _showSubmitIfReady: function() {
        var submitBtn = document.getElementById('submitBtn');
        if (!submitBtn) return;
        if (this.currentQ < this.total - 1) return;
        var lastAns = this.answers[this.total - 1];
        // -2 表示超时未答，也视为已作答（否则末题超时后提交按钮永不显示，用户被卡死）
        if (lastAns === undefined || lastAns === null || lastAns === -1) return;
        submitBtn.style.display = 'inline-block';
        if (this.studyMode) submitBtn.textContent = '完成背题';
      },

      _startTimer: function() {
        var self = this;
        self.isAnswered = false;
        if (!self.useTimer) return;
        self.timeLeft = self.timePerQuestion;
        self._updateTimerBar();
        clearInterval(self.timerId);
        self.timerId = setInterval(function() {
          self.timeLeft--;
          self._updateTimerBar();
          if (self.timeLeft <= 0) {
            clearInterval(self.timerId);
            self.timeoutCount++;
            if (self.answerInit === -1) {
              if (self.answers[self.currentQ] === -1) self.answers[self.currentQ] = -2;
            } else {
              if (self.answers[self.currentQ] === undefined) self.answers[self.currentQ] = null;
            }
            self._advance();
          }
        }, 1000);
      },

      _updateTimerBar: function() {
        var pct = (this.timeLeft / this.timePerQuestion) * 100;
        var bar = document.getElementById('qtimerFill');
        if (!bar) return;
        bar.style.width = pct + '%';
        bar.className = 'qtimer-fill';
        if (this.timeLeft <= 5) bar.classList.add('danger');
        else if (this.timeLeft <= 7) bar.classList.add('warn');
      },

      _advance: function() {
        if (this.currentQ < this.total - 1) { this.currentQ++; this.renderQuestion(); }
        else this._showSubmitIfReady();
      },

      nextQ: function() {
        if (this._autoAdvanceTimer) { clearTimeout(this._autoAdvanceTimer); this._autoAdvanceTimer = null; }
        if (this.answerInit === -1) {
          if (this.answers[this.currentQ] < 0 && this.answers[this.currentQ] !== -2) return;
        } else {
          if (this.answers[this.currentQ] === undefined || this.answers[this.currentQ] === null) return;
        }
        if (this.currentQ < this.total - 1) {
          this.currentQ++;
          clearInterval(this.timerId);
          this.renderQuestion();
        }
      },

      prevQ: function() {
        if (this._autoAdvanceTimer) { clearTimeout(this._autoAdvanceTimer); this._autoAdvanceTimer = null; }
        if (this.currentQ > 0) {
          this.currentQ--;
          clearInterval(this.timerId);
          this.renderQuestion();
        }
      },

      _updateElapsedTime: function() {
        if (!this.startTime) return;
        var s = Math.floor((Date.now() - this.startTime) / 1000);
        var m = Math.floor(s / 60);
        var ss = s % 60;
        var el = document.getElementById('elapsedTime');
        if (el) {
          var h = '\u5DF2\u7528\u65F6: ' + String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
          if (this.timeLeft > 0 && this.timePerQuestion > 0) {
            var tc = this.timeLeft <= 5 ? '#e74c3c' : '#f39c12';
            var anim = this.timeLeft <= 5 ? 'animation:timePulse .5s infinite;' : '';
            h += ' <span style="color:' + tc + ';font-size:20px;font-weight:700;' + anim + 'margin-left:12px">\u23F0 ' + this.timeLeft + '\u79D2</span>';
          }
          el.innerHTML = h;
        }
      },

      _updateMotivation: function() {
        var el = document.getElementById('motivationTip');
        if (!el) return;
        var pct = Math.round((this.currentQ + 1) / this.total * 100);
        var mins = this.startTime ? Math.floor((Date.now() - this.startTime) / 60000) : 0;
        var msgs = [
          this._tips[this.currentQ % this._tips.length],
          '\uD83D\uDCCA \u5DF2\u5B8C\u6210 ' + pct + '%\uFF0C\u7EE7\u7EED\u52A0\u6CB9\uFF01',
          '\u23F1 \u7528\u65F6 ' + mins + ' \u5206\u949F\uFF0C\u8282\u594F\u5F88\u597D'
        ];
        el.style.opacity = '0';
        setTimeout(function() {
          el.textContent = msgs[this.currentQ % msgs.length];
          el.style.opacity = '1';
        }.bind(this), 100);
      },

      submit: async function() {
        var self = this;
        if (self._submitting) return null;
        if (self.studyMode) {
          self.finishStudy();
          return null;
        }
        self._submitting = true;
        clearInterval(self.timerId);
        if (self.elapsedTimerId) clearInterval(self.elapsedTimerId);
        var timeUsed = self.startTime ? Math.floor((Date.now() - self.startTime) / 1000) : 0;

        if (self.questionFormat === 'yesno') {
          for (var i = 0; i < self.total; i++) {
            if (self.answers[i] === undefined) { self.currentQ = i; await self.renderQuestion(); showToast('\u8FD8\u6709\u9898\u76EE\u672A\u4F5C\u7B54\uFF01', 'error'); self._submitting = false; return null; }
          }
        } else if (self.questionFormat === 'choice') {
          var unanswered = 0;
          for (var i = 0; i < self.total; i++) { if (self.answers[i] < 0) unanswered++; }
          if (unanswered > 0 && !(await UiKit.confirm('\u63D0\u793A','\u8FD8\u6709 ' + unanswered + ' \u9053\u9898\u672A\u4F5C\u7B54\uFF0C\u786E\u5B9A\u8981\u63D0\u4EA4\u5417\uFF1F',{okText:'仍然提交',cancelText:'继续作答',danger:true}))) { self._submitting = false; return null; }
        } else if (self.questionFormat === 'likert') {
          for (var i = 0; i < self.total; i++) {
            if (self.answers[i] === undefined) { self.currentQ = i; await self.renderQuestion(); showToast('\u8FD8\u6709\u9898\u76EE\u672A\u4F5C\u7B54\uFF01', 'error'); self._submitting = false; return null; }
          }
        }

        var btn = document.getElementById('submitBtn');
        if (btn) { btn.disabled = true; btn.textContent = '\u63D0\u4EA4\u4E2D...'; }

        var _submitLen = Math.max(self.total, self.maxTotal);
        var safeAnswers = [];
        for (var _i = 0; _i < _submitLen; _i++) {
          var _a = self.answers[_i];
          safeAnswers[_i] = (typeof _a === 'number' && !isNaN(_a)) ? _a : -1;
        }
        var body = { answers: safeAnswers, questionIndices: self.questionIndices };
        if (self.questionFormat !== 'likert') body.timeUsed = timeUsed;

        try {
          if (window.AndroidKeepScreenOn) window.AndroidKeepScreenOn.disable();
          var data = await ApiClient.post('/submit/' + self.testId, body);
          if (!data.success) {
            if (btn) { btn.disabled = false; btn.textContent = '\u63D0\u4EA4\u6D4B\u9A8C'; }
            showToast('\u63D0\u4EA4\u5931\u8D25\uFF1A' + (data.msg || '\u8BF7\u91CD\u8BD5'), 'error');
            self._submitting = false;
            return null;
          }
          self._clearProgress();
          self.resultData = data.result;
          return { result: data.result, timeUsed: timeUsed, timeoutCount: self.timeoutCount };
        } catch (e) {
          if (btn) { btn.disabled = false; btn.textContent = '\u63D0\u4EA4\u6D4B\u9A8C'; }
          showToast('\u7F51\u7EDC\u9519\u8BEF\uFF1A' + e.message, 'error');
          self._submitting = false;
          return null;
        }
      },

      finishStudy: function() {
        var self = this;
        var _st = window.StudyMode ? StudyMode.computeStats(self.questions, self.answers, self.total) : null;
        self._clearProgress();
        if (self.elapsedTimerId) clearInterval(self.elapsedTimerId);
        var _ni = window.StudyMode ? StudyMode.genIndices(self.bankSize || self.bankFallback || self.total, self.total) : null;
        if (_ni) self.questionIndices = _ni;
        self.questions = {};
        self.studyMode = false;
        self.currentQ = 0;
        self.answers = [];
        var welcome = document.getElementById('welcomeScreen');
        var test = document.getElementById('testScreen');
        if (welcome) welcome.style.display = 'block';
        if (test) test.style.display = 'none';
        if (_st && window.StudyMode) StudyMode.showSummary(_st);
      },

      showConfetti: function() {
        var d = document.createElement('div');
        d.id = 'confetti';
        d.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:9998;overflow:hidden';
        var emojis = ['\uD83C\uDF89', '\u2B50', '\uD83C\uDF8A', '\u2728', '\uD83C\uDF1F', '\uD83D\uDCAB', '\uD83C\uDF88', '\uD83C\uDF81', '\uD83C\uDFC6', '\uD83D\uDC8E', '\uD83E\uDD73', '\uD83C\uDF80'];
        var html = '';
        for (var i = 0; i < 18; i++) {
          var e = emojis[i % emojis.length];
          var left = (5 + i * 5.2).toFixed(1);
          var size = 14 + Math.floor(Math.random() * 16);
          var dur = 2.5 + Math.random() * 2.5;
          var delay = Math.random() * 2;
          html += '<div style="position:absolute;top:-10px;left:' + left + '%;font-size:' + size + 'px;animation:confettiFall ' + dur.toFixed(1) + 's ease-in ' + delay.toFixed(1) + 's forwards">' + e + '</div>';
        }
        d.innerHTML = html;
        document.documentElement.appendChild(d);
        setTimeout(function() { if (d.parentNode) d.remove(); }, 6000);
      },

      destroy: function() {
        clearInterval(this.timerId);
        clearInterval(this.elapsedTimerId);
      }
    };

    return engine;
  }
};
