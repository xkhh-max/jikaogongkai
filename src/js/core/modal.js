// ===== Unified Modal System =====
// Usage: var ref = Modal.open({ title, html, size, className, onClose, onOpen, closable, backdrop })
// ref.close() to close programmatically
// Modal.close(id) / Modal.closeAll() also available

(function() {
  'use strict';

  var _stack = [];
  var _zBase = 100010;
  var _scrollY = 0;
  var _lockCount = 0;
  var _prevFocus = null;

  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function getFocusable(el) {
    return Array.from(el.querySelectorAll(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    )).filter(function(n) { return n.offsetParent !== null; });
  }

  function lock() {
    // 优先复用 app.js 的全局滚动锁（同一计数器），避免与 PopupNotice 等叠开时互相解锁
    if (window.lockBodyScroll) { window.lockBodyScroll(); _lockCount++; return; }
    if (_lockCount === 0) {
      _scrollY = window.scrollY || window.pageYOffset || 0;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + _scrollY + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    }
    _lockCount++;
  }

  function unlock() {
    if (window.unlockBodyScroll) { window.unlockBodyScroll(); if (_lockCount > 0) _lockCount--; return; }
    _lockCount--;
    if (_lockCount <= 0) {
      _lockCount = 0;
      var sy = _scrollY;
      var html = document.documentElement;
      var prevScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      window.scrollTo(0, sy);
      html.style.scrollBehavior = prevScrollBehavior;
    }
  }

  function open(opts) {
    opts = opts || {};
    if (!_prevFocus) _prevFocus = document.activeElement;

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay' + (opts.overlayClass ? ' ' + opts.overlayClass : '');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    if (opts.id) overlay.id = opts.id;
    if (opts.title) overlay.setAttribute('aria-label', opts.title);

    var z = _zBase + _stack.length * 2;
    overlay.style.zIndex = z;

    var sizeClass = opts.size ? ' modal-' + opts.size : '';
    var boxClass = opts.className ? ' ' + opts.className : '';

    var h = '<div class="modal-box' + sizeClass + boxClass + '"';
    if (opts.width) h += ' style="max-width:' + opts.width + '"';
    h += '>';

    if (opts.title || opts.closable !== false) {
      h += '<div class="modal-header">';
      if (opts.title) h += '<h3>' + esc(opts.title) + '</h3>';
      if (opts.closable !== false) h += '<button class="modal-close" aria-label="关闭">&times;</button>';
      h += '</div>';
    }

    h += '<div class="modal-body">' + (opts.html || '') + '</div>';
    h += '</div>';

    overlay.innerHTML = h;
    document.documentElement.appendChild(overlay);

    lock();

    void overlay.offsetHeight;
    overlay.classList.add('active');

    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      overlay.classList.remove('active');
      var restoreFocus = _prevFocus;
      setTimeout(function() {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        var idx = -1;
        for (var i = 0; i < _stack.length; i++) {
          if (_stack[i].overlay === overlay) { idx = i; break; }
        }
        if (idx !== -1) _stack.splice(idx, 1);
        unlock();
        if (opts.onClose) opts.onClose();
        if (_stack.length === 0) _prevFocus = null;
        if (restoreFocus && restoreFocus.focus) {
          try { restoreFocus.focus(); } catch(e) {}
        }
      }, 300);
    }

    var entry = { overlay: overlay, close: close, opts: opts };
    _stack.push(entry);

    var closeBtn = overlay.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', close);

    if (opts.backdrop !== false) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) close();
      });
    }

    overlay.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        var focusable = getFocusable(overlay);
        if (focusable.length === 0) { e.preventDefault(); return; }
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    });

    setTimeout(function() {
      var autofocus = overlay.querySelector('[autofocus]');
      if (autofocus) { autofocus.focus(); return; }
      var focusable = getFocusable(overlay);
      if (focusable.length > 0) focusable[0].focus();
    }, 50);

    if (opts.onOpen) opts.onOpen(overlay);

    return { close: close, overlay: overlay, body: overlay.querySelector('.modal-body') };
  }

  function closeAll() {
    var arr = _stack.slice().reverse();
    for (var i = 0; i < arr.length; i++) arr[i].close();
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && _stack.length > 0) {
      var top = _stack[_stack.length - 1];
      if (top.opts.closable !== false) {
        e.preventDefault();
        top.close();
      }
    }
  });

  window.Modal = {
    open: open,
    close: function(idOrOverlay) {
      for (var i = 0; i < _stack.length; i++) {
        var e = _stack[i];
        if (e.overlay === idOrOverlay || e.overlay.id === idOrOverlay) { e.close(); return; }
      }
    },
    closeAll: closeAll,
    isOpen: function() { return _stack.length > 0; },
    count: function() { return _stack.length; },
    _lock: lock,
    _unlock: unlock
  };
})();
