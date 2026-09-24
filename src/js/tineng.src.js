// ============================================================
// 体质体能评分系统 - 可读源码
// 修改评分权重请搜索 "权重" 或 "W_TIZHI" / "W_TINENG"
// ============================================================

// ===== 域名保护 =====
(function() {
  var ALLOWED = ['wuweisixing.cn', 'bxz.rongjun.fun', 'xl.xlnice.top'];
  function checkDomain() {
    try {
      var h = location.hostname;
      if (ALLOWED.indexOf(h) !== -1 || h === 'localhost' || h === '127.0.0.1' || h === '::1' ||
          h.endsWith('.bxz.rongjun.fun') || h.endsWith('.wuweisixing.cn') || h.endsWith('.pages.dev')) return;
      document.body.innerHTML = '';
      document.title = '';
      location.replace('about:blank');
    } catch(e) {}
  }
  checkDomain();
  setInterval(checkDomain, 4000);
})();

(function(){
  var ALLOWED = ['wuweisixing.cn', 'bxz.rongjun.fun', 'xl.xlnice.top'];
  var h = location.hostname;
  var ok = ALLOWED.indexOf(h) !== -1 || h === 'localhost' || h.endsWith('.bxz.rongjun.fun') ||
           h.endsWith('.wuweisixing.cn') || h.endsWith('.pages.dev') || h === '127.0.0.1' || h === '::1';
  if (!ok) {
    document.body.innerHTML = '<div style="text-align:center;margin-top:40vh;padding:20px">' +
      '<h1 style="color:#c0392b">⚠️ 未经授权</h1>' +
      '<p style="color:var(--text-light);margin-top:16px">本系统仅限授权站点使用<br>' +
      '请访问 <a href="https://wuweisixing.cn" style="color:#2a5a8f">wuweisixing.cn</a></p></div>';
    throw new Error('Domain not authorized');
  }
})();

// ===== 登录检查（已移除，体能评分无需登录即可使用，查询排名时需登录） =====

let gender = 'male';

// ===== 性别切换 =====
function setGender(g) {
  gender = g;
  document.getElementById('btn-male').className = g === 'male' ? 'active' : '';
  document.getElementById('btn-female').className = g === 'female' ? 'active' : '';
  if (g === 'male') {
    document.getElementById('item3-name').textContent = '投掷(男)';
    document.getElementById('item3-label').textContent = '请输入投掷成绩（2kg实心球，单位：米）';
    document.getElementById('v_tz').placeholder = '男 15.7 满分';
  } else {
    document.getElementById('item3-name').textContent = '仰卧起坐(女)';
    document.getElementById('item3-label').textContent = '请输入1分钟仰卧起坐个数';
    document.getElementById('v_tz').placeholder = '女 56 满分';
  }
  document.getElementById('v_pingheng').placeholder = g === 'male' ? '86秒满分 . 例如：60' : '90秒满分 . 例如：60';
  buildAllRefTables();
  calc();
}

// ===== 评分查询 =====
function getScore(key, val) {
  if (val == null || isNaN(val)) return null;
  var table = REF_DATA[key][gender];
  if (!table || table.length === 0) return null;
  if (key === 'run') {
    // 跑步：数值越低越好（秒数越少）
    if (val <= table[0][0]) return 100;
    if (val >= table[table.length - 1][0]) return 10;
    for (var i = 0; i < table.length - 1; i++) {
      var v1 = table[i][0], s1 = table[i][1];
      var v2 = table[i + 1][0], s2 = table[i + 1][1];
      if (val >= v1 && val <= v2) return Math.round((s1 + (val - v1) / (v2 - v1) * (s2 - s1)) * 10) / 10;
    }
    return 10;
  }
  // 其他项目：数值越高越好
  if (val >= table[0][0]) return 100;
  if (val <= table[table.length - 1][0]) return 10;
  for (var i = 0; i < table.length - 1; i++) {
    var v1 = table[i][0], s1 = table[i][1];
    var v2 = table[i + 1][0], s2 = table[i + 1][1];
    if (val <= v1 && val >= v2) return Math.round((s1 + (v1 - val) / (v1 - v2) * (s2 - s1)) * 10) / 10;
  }
  return 10;
}

function getBMIScore(bmi) {
  if (!isFinite(bmi) || bmi <= 0) return null;
  if (gender === 'male') {
    if (bmi < 17.5 || bmi >= 30) return null;
    if (bmi >= 17.9 && bmi <= 23.9) return 100;
    if (bmi <= 17.8 || (bmi > 23.9 && bmi <= 25.9)) return 80;
    if (bmi >= 26.0 && bmi <= 27.9) return 60;
    return 50;
  } else {
    if (bmi < 17 || bmi >= 24) return null;
    if (bmi >= 20.0 && bmi <= 22.6) return 100;
    if ((bmi >= 19.0 && bmi <= 19.9) || (bmi >= 22.7 && bmi <= 23.7)) return 80;
    return 60;
  }
}

// ============================================================
// ★★★ 评分权重 - 修改这里 ★★★
// ============================================================
// 体质类权重（3项总和 = 1.0）
const W_TIZHI = { bmi: 0.32, feihuo: 0.36, pingheng: 0.32 };

// 体能类权重（5项总和 = 1.0）
const W_TINENG = { ldty: 0.20, run: 0.22, tz: 0.20, ts: 0.20, zwtqq: 0.18 };
// ============================================================

// ===== 主计算 =====
function calc() {
  function getV(id) { var v = parseFloat(document.getElementById(id).value); return isNaN(v) ? null : v; }

  var height = getV('v_height');
  var weight = getV('v_weight');

  // BMI 显示与分类
  if (height && weight) {
    var bmi = weight / ((height / 100) * (height / 100));
    document.getElementById('bmiValue').textContent = bmi.toFixed(1);
    var cls, sug, color;
    if (bmi < 18.5) { cls = '偏瘦'; sug = '建议适当增加营养摄入'; color = '#e67e22'; }
    else if (bmi < 24) { cls = '正常'; sug = '体质指数正常，请继续保持'; color = '#27ae60'; }
    else if (bmi < 28) { cls = '超重'; sug = '建议适当控制饮食，增加运动'; color = '#e67e22'; }
    else { cls = '肥胖'; sug = '建议制定减重计划，控制饮食并加强锻炼'; color = '#e74c3c'; }
    document.getElementById('bmiClass').textContent = cls;
    document.getElementById('bmiClass').style.color = color;
    var sugEl = document.getElementById('bmiSuggestion');
    sugEl.textContent = '💡 ' + sug;
    sugEl.style.display = 'block';
    sugEl.style.background = color === '#27ae60' ? '#e8f5e9' : '#fff3e0';
    sugEl.style.color = color;
  } else {
    document.getElementById('bmiValue').textContent = '--';
    document.getElementById('bmiClass').textContent = '';
    document.getElementById('bmiSuggestion').style.display = 'none';
  }

  // 获取各项目数值
  var feihuo = getV('v_feihuo');
  var pingheng = getV('v_pingheng');
  var ldty = getV('v_ldty');
  var run_m = parseInt(document.getElementById('v_run_m').value, 10) || 0;
  var run_s = parseInt(document.getElementById('v_run_s').value, 10) || 0;
  var runTotal = run_m * 60 + run_s;
  var runVal = (run_m === 0 && run_s === 0) ? null : runTotal;
  var tz = getV('v_tz');
  var ts = getV('v_ts');
  var zwtqq = getV('v_zwtqq');

  // 计算各项目分数
  var bmiVal = (height && weight) ? weight / ((height / 100) * (height / 100)) : null;
  var bmiScore = bmiVal ? getBMIScore(bmiVal) : null;
  var feihuoScore = feihuo !== null ? getScore('feihuo', feihuo) : null;
  var pinghengScore = pingheng !== null ? getScore('pingheng', pingheng) : null;
  var ldtyScore = ldty !== null ? getScore('ldty', ldty) : null;
  var runScore = runVal !== null ? getScore('run', runVal) : null;
  var tzScore = tz !== null ? getScore('tz', tz) : null;
  var tsScore = ts !== null ? getScore('ts', ts) : null;
  var zwtqqScore = zwtqq !== null ? getScore('zwtqq', zwtqq) : null;

  // 显示分数
  function setScore(id, weightedId, score, weight) {
    document.getElementById(id).textContent = (score === null || score === undefined) ? '--' : score.toFixed(1);
    if (document.getElementById(weightedId)) {
      document.getElementById(weightedId).textContent = (score === null || score === undefined) ? '--' : (score * weight).toFixed(2);
    }
  }

  setScore('s_bmi', 'w_bmi', bmiScore, W_TIZHI.bmi);
  setScore('s_feihuo', 'w_feihuo', feihuoScore, W_TIZHI.feihuo);
  setScore('s_pingheng', 'w_pingheng', pinghengScore, W_TIZHI.pingheng);
  setScore('s_ldty', 'w_ldty', ldtyScore, W_TINENG.ldty);
  setScore('s_run', 'w_run', runScore, W_TINENG.run);
  setScore('s_tz', 'w_tz', tzScore, W_TINENG.tz);
  setScore('s_ts', 'w_ts', tsScore, W_TINENG.ts);
  setScore('s_zwtqq', 'w_zwtqq', zwtqqScore, W_TINENG.zwtqq);

  // 体质总分
  var tizhiTotal = 0, tizhiAny = false;
  var tizhiItems = {};
  [{ key: 'bmi', score: bmiScore, weight: W_TIZHI.bmi, name: 'BMI' },
   { key: 'feihuo', score: feihuoScore, weight: W_TIZHI.feihuo, name: '肺活量' },
   { key: 'pingheng', score: pinghengScore, weight: W_TIZHI.pingheng, name: '平衡能力' }
  ].forEach(function(item) {
    var weighted = item.score !== null ? Math.round(item.score * item.weight * 100) / 100 : null;
    tizhiItems[item.key] = { score: item.score, weight: item.weight, name: item.name, weighted: weighted };
    if (item.score !== null) { tizhiTotal += item.score * item.weight; tizhiAny = true; }
  });
  tizhiTotal = Math.round(tizhiTotal * 10) / 10;

  // 体能总分
  var tinengTotal = 0, tinengAny = false;
  var tinengItems = {};
  [{ key: 'ldty', score: ldtyScore, weight: W_TINENG.ldty, name: '立定跳远' },
   { key: 'run', score: runScore, weight: W_TINENG.run, name: gender === 'male' ? '1000米' : '800米' },
   { key: 'tz', score: tzScore, weight: W_TINENG.tz, name: gender === 'male' ? '投掷' : '仰卧起坐' },
   { key: 'ts', score: tsScore, weight: W_TINENG.ts, name: '跳绳' },
   { key: 'zwtqq', score: zwtqqScore, weight: W_TINENG.zwtqq, name: '坐位体前屈' }
  ].forEach(function(item) {
    var weighted = item.score !== null ? Math.round(item.score * item.weight * 100) / 100 : null;
    tinengItems[item.key] = { score: item.score, weight: item.weight, name: item.name, weighted: weighted };
    if (item.score !== null) { tinengTotal += item.score * item.weight; tinengAny = true; }
  });
  tinengTotal = Math.round(tinengTotal * 10) / 10;

  // 更新结果卡片 + 渲染
  updateResultCard('tizhi', tizhiTotal, tizhiAny);
  updateResultCard('tineng', tinengTotal, tinengAny);

  if (tizhiAny || tinengAny) {
    renderEnhancedResult(tizhiTotal, tizhiAny, tizhiItems, tinengTotal, tinengAny, tinengItems);
    // 显示查询排名按钮
    var rankBtn = document.getElementById('rankingInfo');
    if (rankBtn) {
      var avgScore = ((tizhiAny ? tizhiTotal : 0) + (tinengAny ? tinengTotal : 0)) / ((tizhiAny ? 1 : 0) + (tinengAny ? 1 : 0));
      rankBtn.innerHTML = '<div style="text-align:center;margin-top:16px"><button onclick="queryRanking(' + avgScore.toFixed(1) + ')" style="background:linear-gradient(135deg,#d4a843,#b8922e);color:#1a1a1a;border:none;padding:10px 28px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:1px">🏆 查询我的排名</button></div>';
    }
  } else {
    document.getElementById('enhancedResult').style.display = 'none';
    var rankEl2 = document.getElementById('rankingInfo');
    if (rankEl2) rankEl2.innerHTML = '';
  }
}

// ===== 更新结果卡片 =====
function updateResultCard(type, total, any) {
  var scoreEl = document.getElementById(type + '-score');
  var levelEl = document.getElementById(type + '-level');
  var weakEl = document.getElementById(type + '-weak');
  if (!any) {
    scoreEl.textContent = '--';
    levelEl.textContent = type === 'tizhi' ? '请填写体质类数据' : '请填写体能类数据';
    levelEl.className = 'level level-empty';
    weakEl.textContent = '';
    return;
  }
  scoreEl.textContent = total.toFixed(1);
  var lc, lbl;
  if (total >= 90) { lc = 'level-excellent'; lbl = '⭐ 卓越'; }
  else if (total >= 80) { lc = 'level-good'; lbl = '✅ 优秀'; }
  else if (total >= 70) { lc = 'level-good'; lbl = '👍 良好'; }
  else if (total >= 60) { lc = 'level-pass'; lbl = '✔ 及格'; }
  else { lc = 'level-fail'; lbl = '❌ 待提升'; }
  levelEl.textContent = lbl;
  levelEl.className = 'level ' + lc;

  // 最弱项提示
  var allItems = Object.assign({}, (type === 'tizhi' ? {
    BMI: parseFloat(document.getElementById('s_bmi').textContent),
    '肺活量': parseFloat(document.getElementById('s_feihuo').textContent),
    '平衡能力': parseFloat(document.getElementById('s_pingheng').textContent)
  } : {
    '立定跳远': parseFloat(document.getElementById('s_ldty').textContent),
    [gender === 'male' ? '1000米' : '800米']: parseFloat(document.getElementById('s_run').textContent),
    [gender === 'male' ? '投掷' : '仰卧起坐']: parseFloat(document.getElementById('s_tz').textContent),
    '跳绳': parseFloat(document.getElementById('s_ts').textContent),
    '坐位体前屈': parseFloat(document.getElementById('s_zwtqq').textContent)
  }));
  var minN = '', minS = 101;
  Object.keys(allItems).forEach(function(n) {
    var s = allItems[n];
    if (!isNaN(s) && s < minS) { minS = s; minN = n; }
  });
  weakEl.textContent = minN ? '⚠️ 弱项：' + minN + '（' + minS.toFixed(1) + '分）' : '';
}

// ===== 增强结果渲染 =====
function renderEnhancedResult(tizhiTotal, tizhiAny, tizhiItems, tinengTotal, tinengAny, tinengItems) {
  var c = document.getElementById('enhancedResult');
  c.style.display = 'block';

  function getLevel(total, any) {
    if (!any) return { level: '--', color: '#666', emoji: '' };
    if (total >= 90) return { level: '卓越', color: '#d4a843', emoji: '🏆' };
    if (total >= 80) return { level: '优秀', color: '#27ae60', emoji: '⭐' };
    if (total >= 70) return { level: '良好', color: '#3498db', emoji: '👍' };
    if (total >= 60) return { level: '及格', color: '#e67e22', emoji: '✔' };
    return { level: '待提升', color: '#e74c3c', emoji: '💪' };
  }

  function ringSVG(total, any, color) {
    if (!any) return '<div class="er-ring" style="opacity:.4"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="7"/></svg><div class="er-ring-num">--</div></div>';
    var dash = (total / 100) * 339;
    return '<div class="er-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="7"/><circle cx="60" cy="60" r="54" fill="none" stroke="' + color + '" stroke-width="7" stroke-dasharray="' + dash + ' 339" transform="rotate(-90 60 60)" stroke-linecap="round"/></svg><div class="er-ring-num">' + (any ? total.toFixed(1) : '--') + '</div></div>';
  }

  var tz = getLevel(tizhiTotal, tizhiAny);
  var tn = getLevel(tinengTotal, tinengAny);

  var h = '<div class="er-card">';
  h += '<div class="er-top">';
  h += '<div class="er-ring-wrap">' + ringSVG(tizhiTotal, tizhiAny, '#4a8cba') + '<div class="er-ring-lbl">🧬 体质类</div></div>';
  h += '<div class="er-summary-card">';
  if (tizhiAny) h += '<div class="er-summary-row" style="font-size:15px;font-weight:700">🧬 体质 ' + tz.emoji + ' ' + tz.level + '</div>';
  if (tinengAny) h += '<div class="er-summary-row" style="font-size:15px;font-weight:700">💪 体能 ' + tn.emoji + ' ' + tn.level + '</div>';
  var avg = (tizhiAny && tinengAny) ? ((tizhiTotal + tinengTotal) / 2).toFixed(1) : (tizhiAny ? tizhiTotal.toFixed(1) : (tinengAny ? tinengTotal.toFixed(1) : '--'));
  if (tizhiAny && tinengAny) h += '<div class="er-summary-row" style="font-size:13px;opacity:.75;margin-top:6px;letter-spacing:1px">综合均分：<b style="font-size:18px">' + avg + '</b></div>';
  h += '</div>';
  h += '<div class="er-ring-wrap">' + ringSVG(tinengTotal, tinengAny, '#4a8c6a') + '<div class="er-ring-lbl">💪 体能类</div></div>';
  h += '</div>';

  if (tizhiAny) {
    h += '<div class="er-cat"><span class="cat-dot" style="background:#4a8cba"></span>🧬 体质类</div><div class="er-bars">';
    Object.keys(tizhiItems).forEach(function(k) {
      var item = tizhiItems[k];
      var sc = item.score;
      if (sc === null) return;
      var bc = sc >= 80 ? 'rgba(74,140,186,.9)' : sc >= 60 ? 'rgba(230,126,34,.9)' : 'rgba(231,76,60,.9)';
      h += '<div class="er-bar-row"><div class="er-bar-nm">' + item.name + '</div><div class="er-bar-bg"><div class="er-bar-fg" style="width:' + Math.min(sc, 100) + '%;background:' + bc + '"></div></div><div class="er-bar-sc">' + sc.toFixed(1) + '</div></div>';
    });
    h += '</div>';
  }

  if (tinengAny) {
    h += '<div class="er-cat"><span class="cat-dot" style="background:#4a8c6a"></span>💪 体能类</div><div class="er-bars">';
    Object.keys(tinengItems).forEach(function(k) {
      var item = tinengItems[k];
      var sc = item.score;
      if (sc === null) return;
      var bc = sc >= 80 ? 'rgba(74,140,106,.9)' : sc >= 60 ? 'rgba(230,126,34,.9)' : 'rgba(231,76,60,.9)';
      h += '<div class="er-bar-row"><div class="er-bar-nm">' + item.name + '</div><div class="er-bar-bg"><div class="er-bar-fg" style="width:' + Math.min(sc, 100) + '%;background:' + bc + '"></div></div><div class="er-bar-sc">' + sc.toFixed(1) + '</div></div>';
    });
    h += '</div>';
  }

  // 建议
  var weakTips = [];
  var ADV = {
    bmi: '体重管理，改善饮食结构', feihuo: '练习腹式呼吸法，加强有氧运动',
    pingheng: '练习闭眼单脚站立', ldty: '加强腿部爆发力训练',
    run: '提升心肺耐力，加强长跑训练', tz: '加强核心上肢力量训练',
    ts: '练习手腕摇绳节奏', zwtqq: '每天拉伸大腿后侧'
  };
  var allItems = Object.assign({}, tizhiItems, tinengItems);
  Object.keys(allItems).forEach(function(k) {
    var sc = allItems[k].score;
    if (sc !== null && sc < 70 && ADV[k]) weakTips.push(allItems[k].name + '：' + ADV[k]);
  });
  if (weakTips.length > 0) {
    h += '<div class="er-summary-text">💡 建议加强：' + weakTips.slice(0, 3).join('；') + '</div>';
  } else if ((tizhiAny && tizhiTotal >= 80) || (tinengAny && tinengTotal >= 80)) {
    h += '<div class="er-summary-text">🎉 各项均衡，继续保持！</div>';
  }

  // 征兵五维四型参考
  if (tinengAny && tinengTotal >= 60) {
    var tinengScores = Object.values(tinengItems).map(function(i) { return i.score; }).filter(function(s) { return s !== null; });
    var strongCount = tinengScores.filter(function(s) { return s >= 80; }).length;
    if (strongCount >= 3) {
      h += '<div class="er-summary-text" style="border-top:none;padding-top:2px;color:#d4a843">🎯 符合“体能型”标准（' + strongCount + '项达优秀），建议定向选择特战/侦察岗位</div>';
    } else {
      h += '<div class="er-summary-text" style="border-top:none;padding-top:2px;opacity:.6">📋 ' + (strongCount > 0 ? '其中' + strongCount + '项达优秀水平' : '暂无项目达优秀线') + '，继续针对性训练可提高定兵优势</div>';
    }
  }

  h += '<div id="rankingInfo"></div>';
  c.innerHTML = h;
}

// ===== 方法说明 =====
var METHOD_DESC = {
  ldty: '测试方法：受试者两脚自然分开站立，站在起跳线后，脚尖不得踩线，两脚原地同时起跳，不得有垫步或连跳动作...',
  run: '测试方法：采用站立式起跑，当听到口令后开始起跑并开表计时，受试者躯干部到达终点线的垂直面停表。',
  tz_male: '测试方法：使用2Kg实心球，采取正面双手头上投掷的方式进行测试。',
  tz_female: '测试方法：受试者仰卧于软垫上，两腿稍分开，屈膝呈90°。',
  ts: '测试方法：受试者前脚掌起跳，同时手腕完成弧形摆动。',
  zwtqq: '测试方法：受试者两腿伸直，脚底紧贴测试纵板坐在平地上。',
  pingheng: '测试方法：受测者两臂侧平举，两腿并拢直立，脚尖向前。',
  bmi: '计算公式：体重指数（BMI）= 体重（Kg） / 身高（M）²。'
};

// ===== 评分标准表 =====
function buildBMIRefTable() {
  var h = '<table><tr><th>分数</th><th>18-21岁（男）</th><th>22-26岁（男）</th><th>18-21岁（女）</th><th>22-26岁（女）</th></tr>';
  var bmiData = [
    [100, '20.0~23.2', '20.6~23.9', '19.9~22.0', '20.0~22.6'],
    [80,  '19.0~19.9或23.3~25.3', '19.6~20.5或24.0~25.9', '18.9~19.8或22.1~23.1', '19.0~19.9或22.7~23.7'],
    [60,  '17.5~18.9或25.4~27.4', '17.5~19.5或26.0~28.0', '17.0~18.8或23.2~24.0', '17.0~18.9或23.8~24.0'],
    [50,  '27.5~30.0', '28.1~30.0', '-', '-']
  ];
  bmiData.forEach(function(r) { h += '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td><td>' + r[4] + '</td></tr>'; });
  h += '</table><div class="method-desc">' + METHOD_DESC.bmi + '</div>';
  document.getElementById('ref_bmi').innerHTML = h;
}

function toggleRef(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.style.display = el.style.display === 'block' ? 'none' : 'block';
}

// ===== 评分标准数据 =====
var REF_DATA = {
  ldty: {
    male: [[273,100],[268,95],[263,90],[256,85],[248,80],[244,78],[240,76],[236,74],[232,72],[228,70],[224,68],[220,66],[216,64],[212,62],[208,60],[203,50],[198,40],[193,30],[188,20],[183,10]],
    female: [[207,100],[201,95],[195,90],[188,85],[181,80],[178,78],[175,76],[172,74],[169,72],[166,70],[163,68],[160,66],[157,64],[154,62],[151,60],[146,50],[141,40],[136,30],[131,20],[126,10]]
  },
  run: {
    male: [[197,100],[202,95],[207,90],[214,85],[222,80],[227,78],[232,76],[237,74],[242,72],[247,70],[252,68],[257,66],[262,64],[267,62],[272,60],[292,50],[312,40],[332,30],[352,20],[372,10]],
    female: [[198,100],[204,95],[210,90],[217,85],[224,80],[229,78],[234,76],[239,74],[244,72],[249,70],[254,68],[259,66],[264,64],[269,62],[274,60],[284,50],[294,40],[304,30],[314,20],[324,10]]
  },
  tz: {
    male: [[15.7,100],[14.0,95],[11.5,90],[11.0,85],[10.4,80],[10.0,78],[9.8,76],[9.5,74],[9.3,72],[9.0,70],[8.8,68],[8.5,66],[8.2,64],[7.9,62],[7.5,60],[7.3,50],[7.0,40],[6.7,30],[6.2,20],[5.8,10]],
    female: [[56,100],[54,95],[52,90],[49,85],[46,80],[44,78],[42,76],[40,74],[38,72],[36,70],[34,68],[32,66],[30,64],[28,62],[26,60],[24,50],[22,40],[20,30],[18,20],[16,10]]
  },
  ts: {
    male: [[198,100],[193,98],[186,96],[178,94],[168,92],[158,90],[152,87],[144,84],[136,81],[124,78],[113,75],[108,72],[101,69],[94,66],[85,63],[75,60],[71,50],[64,40],[58,30],[49,20],[40,10]],
    female: [[190,100],[184,98],[175,96],[166,94],[154,92],[142,90],[137,87],[130,84],[122,81],[112,78],[102,75],[98,72],[92,69],[86,66],[78,63],[70,60],[66,50],[59,40],[53,30],[44,20],[35,10]]
  },
  zwtqq: {
    male: [[24.9,100],[23.1,95],[21.3,90],[19.5,85],[17.7,80],[16.3,78],[14.9,76],[13.5,74],[12.1,72],[10.7,70],[9.3,68],[7.9,66],[6.5,64],[5.1,62],[3.7,60],[2.7,50],[1.7,40],[0.7,30],[-0.3,20],[-1.3,10]],
    female: [[25.8,100],[24.0,95],[22.2,90],[20.6,85],[19.0,80],[17.7,78],[16.4,76],[15.1,74],[13.8,72],[12.5,70],[11.2,68],[9.9,66],[8.6,64],[7.3,62],[6.0,60],[5.2,50],[4.4,40],[3.6,30],[2.8,20],[2.0,10]]
  },
  feihuo: {
    male: [[5240,100],[5120,95],[5000,90],[4750,85],[4500,80],[4380,78],[4260,76],[4140,74],[4020,72],[3900,70],[3780,68],[3660,66],[3540,64],[3420,62],[3300,60],[3130,50],[2960,40],[2790,30],[2620,20],[2450,10]],
    female: [[3550,100],[3500,95],[3450,90],[3300,85],[3150,80],[3050,78],[2950,76],[2850,74],[2750,72],[2650,70],[2550,68],[2450,66],[2350,64],[2250,62],[2150,60],[2110,50],[2070,40],[2030,30],[1990,20],[1950,10]]
  },
  pingheng: {
    male: [[86,100],[63,95],[51,90],[38,85],[30,80],[24,75],[19,70],[16,65],[12,60],[9,55],[5,50],[4,30],[1,10]],
    female: [[90,100],[68,95],[56,90],[41,85],[33,80],[26,75],[21,70],[17,65],[13,60],[10,55],[6,50],[3,30],[1,10]]
  }
};

function buildRefTable(key, title, unit, methodKey) {
  var table = REF_DATA[key][gender];
  if (!table || table.length === 0) return '<div style="padding:8px;color:var(--text-lighter)">暂无数据</div>';
  var h = '<table><tr><th>分数</th><th>' + title + ' (' + unit + ')</th></tr>';
  table.forEach(function(r) {
    var val = r[0], score = r[1];
    var dv = val;
    if (key === 'run') { var m = Math.floor(val / 60), s = val % 60; dv = m + "'" + (s < 10 ? '0' : '') + s + '"'; }
    h += '<tr><td>' + score + '</td><td>' + dv + '</td></tr>';
  });
  h += '</table>';
  var mk = methodKey || key;
  if (METHOD_DESC[mk]) h += '<div class="method-desc">' + METHOD_DESC[mk] + '</div>';
  else if (gender === 'male' && METHOD_DESC[mk + '_male']) h += '<div class="method-desc">' + METHOD_DESC[mk + '_male'] + '</div>';
  else if (gender === 'female' && METHOD_DESC[mk + '_female']) h += '<div class="method-desc">' + METHOD_DESC[mk + '_female'] + '</div>';
  return h;
}

function buildAllRefTables() {
  document.getElementById('ref_ldty').innerHTML = buildRefTable('ldty', '立定跳远', '厘米', 'ldty');
  document.getElementById('ref_run').innerHTML = buildRefTable('run', gender === 'male' ? '1000米跑' : '800米跑', '分秒', 'run');
  document.getElementById('ref_tz').innerHTML = buildRefTable('tz', gender === 'male' ? '投掷(2kg实心球)' : '仰卧起坐(1分钟)', gender === 'male' ? '米' : '个', 'tz');
  document.getElementById('ref_ts').innerHTML = buildRefTable('ts', '跳绳(1分钟)', '个', 'ts');
  document.getElementById('ref_zwtqq').innerHTML = buildRefTable('zwtqq', '坐位体前屈', '厘米', 'zwtqq');
  document.getElementById('ref_feihuo').innerHTML = buildRefTable('feihuo', '肺活量', 'ml', 'feihuo');
  document.getElementById('ref_pingheng').innerHTML = buildRefTable('pingheng', '闭眼单脚站立', '秒', 'pingheng');
  buildBMIRefTable();
}

// ===== 查询排名 =====
function queryRanking(score) {
  var rankEl = document.getElementById('rankingInfo');
  if (!rankEl) return;
  rankEl.innerHTML = '<div style="text-align:center;font-size:13px;color:var(--text-lighter);padding:8px">正在查询排名...</div>';
  if (!Auth.isLoggedIn()) {
    rankEl.innerHTML = '<div style="text-align:center;font-size:13px;color:#e74c3c;padding:8px">请先登录后查询排名</div>';
    return;
  }
  var token = Auth.getToken();
  if (!token) { rankEl.innerHTML = ''; return; }

  fetch('/api/tineng/rank/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ totalScore: score })
  }).then(function(r) { return r.json(); }).then(function(d) {
    if (d.success) {
      fetch('/api/tineng/rank/query?score=' + score, {
        headers: { 'Authorization': 'Bearer ' + token }
      }).then(function(r2) { return r2.json(); }).then(function(d2) {
        if (d2.success && d2.data) {
          var rd = d2.data;
          var h = '<div style="text-align:center;margin-top:14px;padding:12px;background:rgba(255,255,255,.08);border-radius:10px;font-size:13px;line-height:1.7">';
          h += '<div>🏆 你在本站排名 <b style="font-size:18px;color:#d4a843">第' + rd.rank + '</b> / ' + rd.total + ' 名</div>';
          h += '<div>超过了 <b style="color:#27ae60;font-size:16px">' + rd.beat + '%</b> 的用户</div>';
          h += '<div style="font-size:11px;opacity:.5;margin-top:4px"><a href="https://wuweisixing.cn" style="color:#8ab;text-decoration:none">wuweisixing.cn</a> 🔒 体质体能测评</div>';
          h += '</div>';
          rankEl.innerHTML = h;
        } else {
          rankEl.innerHTML = '<div style="text-align:center;font-size:13px;color:var(--text-lighter);padding:8px">暂无排名数据</div>';
        }
      }).catch(function() { rankEl.innerHTML = '<div style="text-align:center;font-size:13px;color:#e74c3c;padding:8px">网络错误</div>'; });
    } else {
      rankEl.innerHTML = '<div style="text-align:center;font-size:13px;color:var(--text-lighter);padding:8px">' + (d.msg || '请先填写数据') + '</div>';
    }
  }).catch(function() { rankEl.innerHTML = '<div style="text-align:center;font-size:13px;color:#e74c3c;padding:8px">网络错误</div>'; });
}

// ===== 工具函数 =====
function fmtRun(sec) {
  if (sec === null || sec === undefined || isNaN(sec)) return '--';
  var m = Math.floor(sec / 60), s = sec % 60;
  return m + "'" + (s < 10 ? '0' : '') + s + '"';
}

function toFixed(v, d) {
  var n = parseFloat(v);
  return isNaN(n) ? '--' : n.toFixed(d);
}

// ===== 复制成绩到剪贴板 =====
function copyScoreText() {
  var cur = window._tnCurrent;
  if (!cur) { showToast('请先填写数据并计算成绩', 'info'); return; }
  var nm = (document.getElementById('exportUserName') || {}).value || '';
  var det = cur.detail || {};
  var lines = [];
  if (nm.trim()) lines.push('姓名：' + nm.trim());
  lines.push('性别：' + (cur.gender === 'female' ? '女' : '男'));
  lines.push('');
  lines.push('=== 体质类 ===');
  var ti = { bmi: { name: '体质指数(BMI)' }, feihuo: { name: '肺活量' }, pingheng: { name: '闭眼单脚站立' } };
  Object.keys(ti).forEach(function(k) {
    var it = det[k];
    if (!it || it.score === undefined) return;
    var v = '';
    if (k === 'bmi') v = 'BMI ' + it.bmi + '（' + it.height + 'cm/' + it.weight + 'kg）';
    else if (k === 'run') v = fmtRun(it.seconds);
    else v = it.value;
    lines.push(ti[k].name + '：' + v + '　得分：' + it.score.toFixed(1));
  });
  if (cur.tizhiScore !== null) lines.push('体质类总分：' + cur.tizhiScore.toFixed(1));
  lines.push('');
  lines.push('=== 体能类 ===');
  var ei = {
    ldty: { name: '立定跳远' },
    run: { name: cur.gender === 'female' ? '800米跑' : '1000米跑' },
    tz: { name: cur.gender === 'female' ? '仰卧起坐' : '投掷' },
    ts: { name: '1分钟跳绳' },
    zwtqq: { name: '坐位体前屈' }
  };
  Object.keys(ei).forEach(function(k) {
    var it = det[k];
    if (!it || it.score === undefined) return;
    var v = '';
    if (k === 'run') v = fmtRun(it.seconds);
    else v = it.value;
    lines.push(ei[k].name + '：' + v + '　得分：' + it.score.toFixed(1));
  });
  if (cur.tinengScore !== null) lines.push('体能类总分：' + cur.tinengScore.toFixed(1));
  lines.push('');
  lines.push('综合评分：' + cur.totalScore.toFixed(1));
  var text = lines.join('\n');
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); showToast('✅ 成绩已复制到剪贴板', 'success'); }
  catch (e) { showToast('复制失败，请手动抄录', 'error'); }
  document.body.removeChild(ta);
}

// ===== 下载CSV表格 =====
function exportTable() {
  var cur = window._tnCurrent;
  if (!cur) { showToast('请先填写数据并计算成绩', 'info'); return; }
  var nm = (document.getElementById('exportUserName') || {}).value || '';
  var now = new Date,
    ts = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  var det = cur.detail || {};
  var fields = [
    { id: 'v_height', l: '身高', u: 'cm' },
    { id: 'v_weight', l: '体重', u: 'kg' },
    { id: 'bmi', l: 'BMI', u: '', scoreId: 's_bmi', weightId: 'w_bmi' },
    { id: 'v_feihuo', l: '肺活量', u: 'ml', scoreId: 's_feihuo', weightId: 'w_feihuo' },
    { id: 'v_pingheng', l: '平衡能力', u: '秒', scoreId: 's_pingheng', weightId: 'w_pingheng' },
    { id: 'v_ldty', l: '立定跳远', u: 'cm', scoreId: 's_ldty', weightId: 'w_ldty' },
    { id: 'run', l: '跑步', u: '分:秒', scoreId: 's_run', weightId: 'w_run' },
    { id: 'v_tz', l: gender === 'male' ? '投掷' : '仰卧起坐', u: gender === 'male' ? 'm' : '次/分', scoreId: 's_tz', weightId: 'w_tz' },
    { id: 'v_ts', l: '跳绳', u: '次/分', scoreId: 's_ts', weightId: 'w_ts' },
    { id: 'v_zwtqq', l: '坐位体前屈', u: 'cm', scoreId: 's_zwtqq', weightId: 'w_zwtqq' }
  ];
  var vals = {};
  fields.forEach(function(f) {
    var raw = '';
    if (f.id === 'bmi') { raw = document.getElementById('bmiValue').textContent; vals.bmi_cls = document.getElementById('bmiClass').textContent; }
    else if (f.id === 'run') { raw = (document.getElementById('v_run_m').value || '0') + ':' + (document.getElementById('v_run_s').value || '00'); }
    else { var el = document.getElementById(f.id); raw = el ? el.value : '--'; }
    vals[f.id] = raw || '--';
    if (f.scoreId) { var se = document.getElementById(f.scoreId); vals[f.id + '_s'] = se ? toFixed(se.textContent, 1) : '--'; }
    if (f.weightId) { var we = document.getElementById(f.weightId); vals[f.id + '_w'] = we ? toFixed(we.textContent, 2) : '--'; }
  });
  var genderText = document.querySelector('.gender-switch .active')?.textContent || '--';
  var ts2 = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');

  // Build CSV with CRLF for Windows Excel compatibility
  var csv = '役前训练体质体能成绩表\r\n';
  if (nm.trim()) csv += '姓名,' + nm.trim() + '\r\n';
  csv += '生成时间,' + ts + '\r\n';
  csv += '性别,' + genderText + '\r\n';
  csv += '\r\n';
  csv += '项目,成绩,得分,权重分\r\n';
  fields.forEach(function(f) {
    var val = vals[f.id] || '--', s = vals[f.id + '_s'] || '--', w = vals[f.id + '_w'] || '--', unit = f.u ? ' ' + f.u : '';
    var valStr = f.id === 'bmi' ? val + (vals.bmi_cls ? '（' + vals.bmi_cls + '）' : '') : val + unit;
    csv += f.l + ',' + valStr + ',' + (s !== '--' ? parseFloat(s).toFixed(1) : '--') + ',' + (w !== '--' ? parseFloat(w).toFixed(2) : '--') + '\r\n';
  });
  // Summary rows
  csv += '\r\n';
  if (cur.tizhiScore !== null) csv += '体质类总分,,' + cur.tizhiScore.toFixed(1) + ',\r\n';
  if (cur.tinengScore !== null) csv += '体能类总分,,' + cur.tinengScore.toFixed(1) + ',\r\n';
  csv += '综合总分,,' + cur.totalScore.toFixed(1) + ',\r\n';

  var bom = '\uFEFF';
  csv = bom + csv;

  var downloadUrl = '/api/tineng/export?d=' + encodeURIComponent(csv);
  var dlFilename = 'tineng_chengjibiao_' + ts2 + '.csv';

  // Strategy 1: Capacitor native file save (APK 专用)
  if (typeof Capacitor !== 'undefined' && Capacitor.isNative && Capacitor.Plugins && Capacitor.Plugins.Filesystem) {
    showToast('正在保存文件...', 'info');
    Capacitor.Plugins.Filesystem.writeFile({
      path: dlFilename,
      data: csv,
      directory: 'DOCUMENTS'
    }).then(function() {
      showToast('✅ 文件已保存到文档目录', 'success');
    }).catch(function(e) {
      showToast('保存失败: ' + e.message, 'error');
    });
    return;
  }

  // Strategy 2: navigator.share with file (iOS/Android 原生分享)
  // 只在首次尝试分享，取消后下次点按钮走 <a> 下载
  window._tnShareCnt = window._tnShareCnt || 0;
  if (window._tnShareCnt < 1 && navigator.share && navigator.canShare) {
    window._tnShareCnt++;
    try {
      var sf = new File([csv], dlFilename, { type: 'text/csv;charset=utf-8' });
      if (navigator.canShare({ files: [sf] })) {
        showToast('点击分享即可保存文件', 'info');
        navigator.share({ files: [sf], title: '体能成绩表' });
        return;
      }
    } catch (e) {}
  }

  // Strategy 3: <a> 元素指向服务端下载接口
  var a = document.createElement('a');
  a.href = downloadUrl;
  a.download = dlFilename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ===== 保存历史成绩 =====
function saveTinengRecord() {
  var cur = window._tnCurrent;
  if (!cur) { showToast('请先填写数据并计算成绩', 'info'); return; }
  if (!Auth.isLoggedIn()) { showToast('请先登录后保存成绩', 'error'); return; }
  var tk = Auth.getToken();
  if (!tk) { showToast('请先登录后保存成绩', 'error'); return; }
  fetch('/api/tineng/history/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tk },
    body: JSON.stringify(cur)
  }).then(function(r) { return r.json(); }).then(function(r) {
    if (r.success) { showToast('✅ 成绩已保存', 'success'); loadTinengHistory(); }
    else { showToast(r.msg || '保存失败', 'error'); }
  }).catch(function() { showToast('网络错误，保存失败', 'error'); });
}

// ===== 加载历史成绩 =====
function loadTinengHistory() {
  var card = document.getElementById('tnHisCard');
  if (!card) return;
  var list = document.getElementById('tnHisList');
  if (!Auth.isLoggedIn()) {
    card.style.display = 'block';
    list.innerHTML = '<div style="font-size:13px;color:var(--text-light);padding:8px 0">登录后可保存并查看历史成绩</div>';
    return;
  }
  var tk = Auth.getToken();
  if (!tk) return;
  fetch('/api/tineng/history', { headers: { 'Authorization': 'Bearer ' + tk } })
    .then(function(r) { return r.json(); })
    .then(function(r) {
      card.style.display = 'block';
      if (!r.success || !r.data || !r.data.length) {
        list.innerHTML = '<div style="font-size:13px;color:var(--text-light);padding:8px 0">暂无历史成绩，填完数据后点击「💾 保存成绩」即可记录</div>';
        return;
      }
      var names = { bmi: '体质指数(BMI)', feihuo: '肺活量', pingheng: '闭眼单脚站立', ldty: '立定跳远', run: '跑步', tz: '投掷/仰卧起坐', ts: '跳绳', zwtqq: '坐位体前屈' };
      var h = '';
      r.data.forEach(function(rec, idx) {
        var lv = rec.totalScore >= 90 ? '#d4a843' : rec.totalScore >= 80 ? '#27ae60' : rec.totalScore >= 70 ? '#3498db' : rec.totalScore >= 60 ? '#e67e22' : '#e74c3c';
        h += '<div style="border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px;overflow:hidden">';
        h += '<div onclick="var d=document.getElementById(\'tnHisD' + idx + '\');d.style.display=d.style.display===\'none\'?\'block\':\'none\'" style="display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;background:#f8fafc;flex-wrap:wrap">';
        h += '<span style="font-size:12px;color:var(--text-light)">' + escapeHtml(rec.date ? chinatime(rec.date) : '--') + '</span>';
        h += '<span style="font-size:12px">' + (rec.gender === 'female' ? '👧' : '👦') + '</span>';
        var _nm2 = (rec.detail._name || '').trim();
        if (_nm2) h += '<span style="font-size:12px;color:var(--text-light);margin-right:4px">' + escapeHtml(_nm2) + '</span>';
        h += '<span style="font-size:13px;color:#4a8cba">体质 ' + (rec.tizhiScore === null ? '--' : rec.tizhiScore) + '</span>';
        h += '<span style="font-size:13px;color:#4a8c6a">体能 ' + (rec.tinengScore === null ? '--' : rec.tinengScore) + '</span>';
        h += '<span style="margin-left:auto;font-weight:700;color:' + lv + '">综合 ' + rec.totalScore + ' 分</span>';
        h += '</div>';
        h += '<div id="tnHisD' + idx + '" style="display:none;padding:10px 12px">';
        var det = rec.detail || {},
          keys = Object.keys(det);
        if (!keys.length) { h += '<div style="font-size:12px;color:var(--text-light)">无单项明细</div>'; } else {
          h += '<table style="width:100%;font-size:13px;border-collapse:collapse"><tr style="color:var(--text-light);font-size:12px"><th style="text-align:left;padding:4px">项目</th><th style="text-align:right;padding:4px">成绩</th><th style="text-align:right;padding:4px">得分</th></tr>';
          keys.filter(function(k) { return k !== '_name'; }).forEach(function(k) {
            var it = det[k] || {},
              nm = k === 'tz' && it.name ? it.name : names[k] || k;
            var val = k === 'bmi' ? 'BMI ' + (it.bmi !== undefined ? it.bmi : '') + '（' + it.height + 'cm/' + it.weight + 'kg）' : k === 'run' ? fmtRun(it.seconds) : it.value;
            h += '<tr style="border-top:1px solid #f1f5f9"><td style="padding:4px">' + escapeHtml(nm) + '</td><td style="text-align:right;padding:4px">' + escapeHtml(String(val === undefined || val === null ? '--' : val)) + '</td><td style="text-align:right;padding:4px;font-weight:600">' + (it.score === null || it.score === undefined ? '--' : it.score) + '</td></tr>';
          });
          h += '</table>';
        }
        h += '</div></div>';
      });
      list.innerHTML = h;
    }).catch(function() {});
}

// ===== 折叠面板 =====
function toggleCollapse(el) {
  var w = el.closest('.collapse-wrap'),
    b = w ? w.querySelector('.collapse-body') : null,
    a = el.querySelector('.collapse-arrow');
  if (b && a) {
    var o = b.style.maxHeight && b.style.maxHeight !== '0px',
      sy = window.scrollY;
    b.style.maxHeight = o ? '0px' : b.scrollHeight + 'px';
    a.style.transform = o ? 'rotate(0deg)' : 'rotate(90deg)';
    if (!o) setTimeout(function() { window.scrollTo({ top: sy, behavior: 'instant' }); }, 0);
  }
}

// ===== 初始化 =====
setGender('male');
document.querySelector('.ti-container').addEventListener('input', function() { calc(); });
calc();
loadTinengHistory();

// ===== 水印 =====
(function() {
  var w = document.createElement('div');
  w.className = 'ti-watermark';
  var t = 'wuweisixing.cn';
  for (var i = 0; i < 30; i++) {
    var s = document.createElement('span');
    s.textContent = t;
    s.style.cssText = 'left:' + (i % 4 * 26 + 2) + '%;top:' + (Math.floor(i / 4) * 20 + 1) + '%';
    w.appendChild(s);
  }
  document.documentElement.appendChild(w);
})();
