// ===== UI 组件库 =====
window.UiKit = {
  toast: function(msg, type, duration) {
    var legacy = document.getElementById('gToast');
    if (legacy && legacy.parentNode) legacy.parentNode.removeChild(legacy);
    var el = document.createElement('div');
    el.className = 'g-toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    document.documentElement.appendChild(el);
    var offset = 60;
    var existing = document.querySelectorAll('.g-toast.show');
    for (var i = 0; i < existing.length; i++) {
      if (existing[i] !== el) offset += existing[i].offsetHeight + 8;
    }
    el.style.top = offset + 'px';
    void el.offsetWidth;
    el.classList.add('show');
    setTimeout(function() {
      el.classList.remove('show');
      setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }, duration || 2500);
  },

modal: function(options) {
     var overlay = document.createElement('div');
     overlay.className = 'uk-modal-overlay';
     overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:200000;padding:20px;animation:fadeIn .2s';
     var box = document.createElement('div');
     box.style.cssText = 'background:var(--card-bg, #fff);border-radius:12px;padding:36px 40px;max-width:400px;width:90%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.25)';
     var html = '';
     if (options.icon) {
       html += '<div style="font-size:48px;margin-bottom:16px">' + options.icon + '</div>';
     }
     if (options.title) {
       html += '<h2 style="margin:0 0 8px;color:var(--text, #333);font-size:18px">' + Utils.escapeHtml(options.title) + '</h2>';
     }
     if (options.content) {
       html += '<p style="color:var(--text-light, #666);margin:0 0 24px;line-height:1.6;font-size:14px">' + options.content + '</p>';
     }
     if (options.html) {
       html += options.html;
     }
     if (options.buttons) {
       html += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">';
       options.buttons.forEach(function(btn) {
         html += '<button class="uk-modal-btn' + (btn.cls ? ' ' + btn.cls : '') + '" style="' + (btn.style || 'background:var(--accent, #3B82F6);color:#fff;border:none;padding:10px 28px;border-radius:8px;font-size:14px;cursor:pointer') + '">' + Utils.escapeHtml(btn.text) + '</button>';
       });
       html += '</div>';
     } else {
       html += '<button class="uk-modal-btn" style="background:var(--accent, #3B82F6);color:#fff;border:none;padding:10px 36px;border-radius:8px;font-size:15px;cursor:pointer;font-weight:500">确定</button>';
     }
     box.innerHTML = html;
     overlay.appendChild(box);
      document.documentElement.appendChild(overlay);

      // Lock body scroll
     if (window.lockBodyScroll) window.lockBodyScroll();

     var close = function() {
       if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
       if (window.unlockBodyScroll) window.unlockBodyScroll();
     };
     overlay.addEventListener('click', function(e) {
       if (e.target === overlay) {
         close();
         if (options.onOverlayClose) options.onOverlayClose();
       }
     });

    var btns = box.querySelectorAll('.uk-modal-btn');
    if (options.buttons) {
      options.buttons.forEach(function(btnOpt, i) {
        if (btns[i]) {
          btns[i].addEventListener('click', function() {
            close();
            if (btnOpt.onClick) btnOpt.onClick();
          });
        }
      });
    } else if (btns[0]) {
      btns[0].addEventListener('click', close);
    }

    return { close: close, overlay: overlay };
  },

  _loadingEl: null,
  _loadingCount: 0,

  showLoading: function() {
    this._loadingCount++;
    if (this._loadingEl) return;
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;z-index:100052';
    el.innerHTML = '<div class="spinner"></div>';
    document.documentElement.appendChild(el);
    this._loadingEl = el;
  },

  hideLoading: function() {
    this._loadingCount--;
    if (this._loadingCount <= 0) {
      this._loadingCount = 0;
      if (this._loadingEl && this._loadingEl.parentNode) {
        this._loadingEl.parentNode.removeChild(this._loadingEl);
      }
      this._loadingEl = null;
    }
  },

  confirm: function(title, content, opts) {
    opts = opts || {};
    return new Promise(function(resolve) {
      var btns = [
        { text: opts.cancelText || '取消', style: 'background:var(--hover-bg, #f3f4f6);color:var(--text-light, #6b7280);border:none;padding:10px 28px;border-radius:8px;font-size:14px;cursor:pointer', onClick: function() { resolve(false); } },
        { text: opts.okText || '确定', style: 'background:var(--accent, #3B82F6);color:#fff;border:none;padding:10px 28px;border-radius:8px;font-size:14px;cursor:pointer', cls: opts.danger ? 'uk-modal-btn-danger' : '', onClick: function() { resolve(true); } }
      ];
      UiKit.modal({
        title: title || '确认',
        content: content,
        buttons: btns,
        onOverlayClose: function() { resolve(false); }
      });
    });
  },

  btnLoading: function(btn, loading, text) {
    if (loading) {
      if (!btn.dataset.origText) btn.dataset.origText = btn.textContent;
      btn.classList.add('btn-loading');
      if (text) btn.textContent = text;
    } else {
      btn.classList.remove('btn-loading');
      btn.textContent = btn.dataset.origText || btn.textContent;
      delete btn.dataset.origText;
    }
  },

  togglePassword: function(inputEl, btnEl) {
    if (inputEl.type === 'password') {
      inputEl.type = 'text';
      btnEl.textContent = '隐藏';
      btnEl.title = '隐藏密码';
    } else {
      inputEl.type = 'password';
      btnEl.textContent = '显示';
      btnEl.title = '显示密码';
    }
  }
};