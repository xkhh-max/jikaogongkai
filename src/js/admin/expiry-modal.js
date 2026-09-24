// ===== 管理后台 — 账户有效期设置弹窗 =====
// 独立文件以避免 inline script 的引号转义问题
(function() {

window.showExpiryModal = function(email, username, currentType, currentExpiresAt) {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999';
  overlay.id = '_expiryOverlay';
  
  var modal = document.createElement('div');
  modal.style.cssText = 'background:var(--card-bg);border-radius:16px;padding:28px;max-width:480px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,.2)';
  
  var typeLabel = currentType === 'trial' ? '体验' : '正式';
  var expiryDate = '';
  if (currentExpiresAt && currentExpiresAt !== '永久') {
    try {
      var _expD = Utils._parseDbTime(currentExpiresAt);
      var _p = {};
      new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(_expD).forEach(function(x) { if (x.type !== 'literal') _p[x.type] = x.value; });
      expiryDate = _p.year + '-' + _p.month + '-' + _p.day;
    } catch(e) {}
  }
  var html = '<h3 style="margin:0 0 16px;font-size:17px;color:var(--text)">设置账户类型与有效期</h3>';
  html += '<div style="margin-bottom:16px;padding:12px;background:var(--hover-bg);border-radius:8px;font-size:13px">';
  html += '<div style="color:var(--text-light);margin-bottom:4px">用户: <strong style="color:var(--text)">' + escapeHtml(username) + '</strong> (' + escapeHtml(email) + ')</div>';
  html += '<div style="color:var(--text-light)">当前: <strong style="color:var(--text)">' + typeLabel + '</strong>';
  if (currentExpiresAt && currentType === 'formal') {
    html += ' &middot; 到期: <strong style="color:var(--text)">' + chinatime(currentExpiresAt).slice(0,10) + '</strong>';
  }
  html += '</div></div>';
  html += '<div style="margin-bottom:16px"><label style="display:block;font-size:13px;color:var(--text-light);margin-bottom:6px;font-weight:600">账户类型</label>';
  html += '<select id="_ea_type" style="width:100%;padding:10px;border:2px solid var(--border);border-radius:8px;font-size:14px;outline:none;background:var(--card-bg)">';
  html += '<option value="trial"' + (currentType === 'trial' ? ' selected' : '') + '>体验用户（无到期日）</option>';
  html += '<option value="formal"' + (currentType === 'formal' ? ' selected' : '') + '>正式用户（有到期日）</option>';
  html += '</select></div>';
  html += '<div style="margin-bottom:16px" id="_ea_expiry_field"><label style="display:block;font-size:13px;color:var(--text-light);margin-bottom:6px;font-weight:600">到期日期</label>';
  html += '<input type="date" id="_ea_expiry" value="' + expiryDate + '" style="width:100%;padding:10px;border:2px solid var(--border);border-radius:8px;font-size:14px;outline:none;background:var(--card-bg);box-sizing:border-box">';
  html += '<div style="font-size:12px;color:var(--text-lighter);margin-top:4px">留空则自动设为当前+365天（正式用户）</div></div>';
  html += '<div style="margin-bottom:16px"><label style="display:block;font-size:13px;color:var(--text-light);margin-bottom:6px;font-weight:600">升级备注 <span style="font-weight:400;font-size:11px;color:var(--text-lighter)">（选填，记录升级原因，供日后查看）</span></label>';
  html += '<textarea id="_ea_remark" maxlength="500" placeholder="如：用户反馈已付款正式码，客服核实后手动开通..." style="width:100%;padding:10px;border:2px solid var(--border);border-radius:8px;font-size:13px;outline:none;background:var(--card-bg);box-sizing:border-box;resize:vertical" rows="2"></textarea></div>';
  html += '<div id="_ea_result" style="margin-bottom:12px"></div>';
  html += '<div style="display:flex;gap:10px;justify-content:flex-end">';
  html += '<button id="_ea_cancel" style="padding:10px 24px;background:var(--hover-bg);color:var(--text-light);border:none;border-radius:8px;font-size:14px;cursor:pointer">取消</button>';
  html += '<button id="_ea_save" style="padding:10px 24px;background:linear-gradient(135deg,var(--accent),var(--accent-dark));color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer">保存</button>';
  html += '</div>';
  
  modal.innerHTML = html;
  overlay.appendChild(modal);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.documentElement.appendChild(overlay);
  
  document.getElementById('_ea_cancel').addEventListener('click', function() { overlay.remove(); });
  document.getElementById('_ea_type').addEventListener('change', function() {
    document.getElementById('_ea_expiry_field').style.display = this.value === 'formal' ? '' : 'none';
  });
  if (currentType !== 'formal') document.getElementById('_ea_expiry_field').style.display = 'none';
  
  document.getElementById('_ea_save').addEventListener('click', async function() {
    var btn = document.getElementById('_ea_save');
    btn.disabled = true;
    btn.textContent = '保存中...';
    var at = document.getElementById('_ea_type').value;
    var ea = at === 'formal' ? document.getElementById('_ea_expiry').value : '';
    var rm = document.getElementById('_ea_remark') ? document.getElementById('_ea_remark').value.trim() : '';
    try {
      var r = await fetch(API_BASE + '/admin/users/set-expiry', {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + Auth.getToken(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, accountType: at, expiresAt: ea || null, remark: rm })
      });
      var d = await r.json();
      if (d.success) { overlay.remove(); loadUsers(); }
      else { document.getElementById('_ea_result').innerHTML = '<div style="color:var(--danger);font-size:13px">' + d.msg + '</div>'; btn.disabled = false; btn.textContent = '保存'; }
    } catch(e) {
      document.getElementById('_ea_result').innerHTML = '<div style="color:var(--danger);font-size:13px">网络错误</div>';
      btn.disabled = false;
      btn.textContent = '保存';
    }
  });
};

})();
