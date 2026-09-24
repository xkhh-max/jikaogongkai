(function(){
function _rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function _shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function _html(str){return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function _totalsec(s){var m=Math.floor(s/60),sec=s%60;return(m<10?'0':'')+m+':'+(sec<10?'0':'')+sec}

var STYLE_ID='_mse_style';
var STYLES='\
.mse-container{max-width:700px;margin:0 auto;padding:16px;width:100%}\
.mse-hidden{display:none!important}\
.mse-header{padding:8px 14px;background:rgba(var(--primary-rgb),.06);color:var(--primary);text-align:center;font-size:13px;font-weight:600;border-radius:10px;margin-bottom:10px;border:1px solid rgba(var(--primary-rgb),.15)}\
.mse-progress{height:8px;background:var(--bg);border-radius:999px;overflow:hidden;margin-bottom:6px}\
.mse-progress-fill{height:100%;border-radius:999px;transition:width .3s ease;background:linear-gradient(135deg,var(--header-start),var(--primary))}\
.mse-timer-bar{height:8px;background:var(--bg);border-radius:999px;overflow:hidden;margin-bottom:12px}\
.mse-timer-fill{height:100%;border-radius:999px;transition:width .3s ease;background:var(--success)}\
.mse-timer-fill.warn{background:var(--warning)}\
.mse-timer-fill.danger{background:var(--danger);animation:msePulse .5s infinite}\
@keyframes msePulse{0%,100%{opacity:1}50%{opacity:.5}}\
@keyframes mseOptPop{0%{transform:scale(.96)}60%{transform:scale(1.02)}100%{transform:scale(1)}}\
.mse-q-area{background:var(--card-bg);border-radius:var(--radius);padding:24px;box-shadow:var(--shadow);margin:8px 0}\
.mse-q-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px;flex-wrap:wrap}\
.mse-q-num{font-size:12px;color:#fff;font-weight:600;background:linear-gradient(135deg,var(--header-start),var(--primary));padding:4px 12px;border-radius:6px}\
.mse-elapsed{font-size:13px;color:var(--text-light);font-weight:700}\
.mse-q-text{font-size:17px;font-weight:500;color:var(--text);line-height:1.7;margin:12px 0}\
.mse-yesno{display:grid;grid-template-columns:1fr 1fr;gap:12px;justify-items:stretch;padding:12px 0}\
.mse-yesno-btn{padding:14px 12px;border:1.5px solid var(--border);border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;transition:all .15s;text-align:center;background:var(--card-bg);color:var(--text);min-width:0;user-select:none;min-height:56px}\
    .mse-yesno-btn:hover{border-color:var(--primary);background:rgba(var(--primary-rgb),.05)}\
    .mse-yesno-btn:active{transform:translateY(0)}\
    .mse-yesno-btn.selected{border-color:var(--primary);background:rgba(var(--primary-rgb),.1);color:var(--primary);box-shadow:0 0 0 3px rgba(var(--primary-rgb),.12);animation:mseOptPop .25s cubic-bezier(.34,1.56,.64,1)}\
    .mse-yesno-btn.selected .hint{color:rgba(var(--primary-rgb),.75)}\
    .mse-yesno-btn .hint{display:block;font-size:11px;color:var(--text-light);font-weight:400;margin-top:4px}\
.mse-opts{display:flex;flex-direction:column;gap:8px}\
.mse-opt{display:flex;align-items:center;gap:10px;padding:14px 16px;border:1.5px solid var(--border);border-radius:10px;cursor:pointer;transition:all .15s;background:var(--card-bg);user-select:none;min-height:48px}\
    .mse-opt:hover{border-color:var(--primary);background:rgba(var(--primary-rgb),.05)}\
    .mse-opt:active{transform:translateY(0)}\
    .mse-opt.selected{border-color:var(--primary);background:rgba(var(--primary-rgb),.1);box-shadow:0 0 0 3px rgba(var(--primary-rgb),.12);animation:mseOptPop .25s cubic-bezier(.34,1.56,.64,1)}\
    .mse-opt.selected .radio{border-color:var(--primary);background:var(--primary);box-shadow:inset 0 0 0 3px var(--card-bg)}\
    .mse-opt.selected .cb{background:var(--primary);border-color:var(--primary);color:#fff}\
    .mse-opt.selected .label{color:var(--primary)}\
    .mse-opt.selected .text{color:var(--text)}\
    .mse-opt .radio{width:20px;height:20px;border-radius:50%;border:2px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .2s}\
    .mse-opt .cb{width:20px;height:20px;border-radius:4px;border:2px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:transparent;transition:all .2s}\
    .mse-opt .label{font-weight:700;color:var(--primary);min-width:18px}\
    .mse-opt .text{color:var(--text)}\
.mse-math-eq{display:flex;align-items:center;justify-content:center;gap:8px;padding:28px 0;flex-wrap:wrap}\
.mse-math-text{font-family:"Courier New",monospace;font-size:clamp(32px,7vw,48px);font-weight:700;color:var(--primary);white-space:nowrap}\
.mse-math-input{width:clamp(48px,8vw,64px);height:clamp(48px,8vw,64px);font-size:clamp(28px,5vw,40px);text-align:center;border:1.5px solid var(--border);border-radius:8px;outline:none;font-weight:700;color:var(--text);font-family:monospace;transition:border-color .15s}\
.mse-math-input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(var(--primary-rgb),.12)}\
.mse-btn{min-height:44px;padding:10px 28px;border-radius:10px;border:none;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}\
.mse-btn.primary{background:linear-gradient(135deg,var(--header-start),var(--primary));color:#fff}\
.mse-btn.primary:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(var(--primary-rgb),.4)}\
.mse-btn.green{background:linear-gradient(135deg,var(--success-dark),var(--success));color:#fff}\
.mse-btn.green:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(var(--success-rgb),.4)}\
.mse-btn.gray{background:var(--card-bg);border:1.5px solid var(--border);color:var(--text-light)}\
.mse-nav{display:flex;justify-content:center;gap:12px;margin-top:16px}\
.mse-welcome{text-align:center;max-width:640px;margin:0 auto;padding:20px}\
.mse-welcome .icon{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--header-start),var(--primary));display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 16px}\
.mse-welcome h2{font-size:24px;color:var(--text);margin-bottom:16px}\
.mse-desc-box{background:rgba(var(--primary-rgb),.06);border-radius:10px;padding:14px 18px;margin:12px 0;text-align:left;font-size:13px;color:var(--text);line-height:1.7;max-height:320px;overflow-y:auto;border:1px solid var(--border)}\
.mse-desc-box b{color:var(--primary)}\
.mse-transition{text-align:center;padding:40px 20px;max-width:500px;margin:0 auto;background:var(--card-bg);border-radius:var(--radius);box-shadow:var(--shadow)}\
.mse-transition .icon{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--header-start),var(--primary));display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 16px}\
.mse-transition h2{font-size:22px;color:var(--text);margin-bottom:8px}\
.mse-transition p{font-size:14px;color:var(--text-light);margin-bottom:6px}\
.mse-next-info{background:var(--hover-bg);border-radius:10px;padding:16px 20px;margin:16px 0;text-align:left}\
.mse-next-info h3{font-size:15px;margin-bottom:8px;color:var(--primary)}\
.mse-next-info p{font-size:13px;color:var(--text-light);margin:4px 0}\
.mse-result{text-align:center;max-width:500px;margin:0 auto;padding:16px}\
.mse-result h2{font-size:20px;margin-bottom:16px}\
.mse-grade-circle{width:120px;height:120px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:12px auto;font-weight:700;animation:mseGlow 2s ease-in-out infinite}\
.mse-grade-circle .letter{font-size:42px}\
.mse-grade-circle .desc{font-size:14px}\
.mse-grade-A{background:linear-gradient(135deg,var(--success),var(--success-dark));color:#fff}\
.mse-grade-B{background:linear-gradient(135deg,#3498db,#2980b9);color:#fff}\
.mse-grade-C{background:linear-gradient(135deg,var(--warning),var(--warning-dark));color:#fff}\
.mse-grade-D{background:linear-gradient(135deg,var(--danger),var(--danger-dark));color:#fff}\
@keyframes mseGlow{0%,100%{box-shadow:0 0 20px rgba(0,0,0,.2)}50%{box-shadow:0 0 40px rgba(0,0,0,.3)}}\
.mse-section-grid{display:grid;gap:10px;margin:16px 0}\
.mse-emotion-box{background:linear-gradient(135deg,rgba(var(--primary-rgb),.04),rgba(var(--primary-rgb),.08));border-radius:14px;padding:20px;margin:12px 0;text-align:left;border-left:4px solid var(--primary)}\
.mse-emotion-box .emoji{font-size:32px;display:block;margin-bottom:6px}\
.mse-emotion-box .msg{font-size:15px;color:var(--text);line-height:1.7}\
.mse-emotion-box.grade-A{background:linear-gradient(135deg,rgba(var(--success-rgb),.08),rgba(var(--success-rgb),.15));border-left-color:var(--success)}\
.mse-emotion-box.grade-B{background:linear-gradient(135deg,rgba(var(--accent-rgb),.08),rgba(var(--accent-rgb),.15));border-left-color:var(--accent)}\
.mse-emotion-box.grade-C{background:linear-gradient(135deg,rgba(var(--warning-rgb),.08),rgba(var(--warning-rgb),.12));border-left-color:var(--warning)}\
.mse-emotion-box.grade-D{background:linear-gradient(135deg,rgba(var(--danger-rgb),.08),rgba(var(--danger-rgb),.12));border-left-color:var(--danger)}\
.mse-analysis-card{background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:16px;margin:10px 0;text-align:left}\
.mse-analysis-card .title{font-size:14px;font-weight:600;color:var(--text);margin-bottom:8px}\
.mse-analysis-bar{height:10px;background:var(--bg);border-radius:999px;overflow:hidden;margin:6px 0}\
.mse-analysis-bar .fill{height:100%;border-radius:999px;transition:width .8s}\
.mse-analysis-card .stats{display:flex;justify-content:space-between;font-size:13px;color:var(--text-light)}\
.mse-result-note{margin-top:10px;padding:10px 12px;background:rgba(var(--gold-rgb),.1);border-left:3px solid var(--gold);border-radius:8px;font-size:12px;color:var(--text);line-height:1.7}\
.mse-analysis-card .stats .num{font-weight:700}\
.mse-analysis-card .comment{font-size:13px;color:var(--text-light);margin-top:6px;line-height:1.5}\
.mse-analysis-card .comment .highlight{color:var(--danger);font-weight:600}\
.mse-analysis-card .comment .good{color:var(--success);font-weight:600}\
.mse-dim-card{background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:16px;margin:10px 0;text-align:left}\
.mse-dim-title{font-size:15px;font-weight:600;color:var(--text);margin-bottom:12px}\
.mse-dim-row{display:flex;align-items:center;justify-content:space-between;padding:6px 0 2px;font-size:13px}\
.mse-dim-row+.mse-analysis-bar{margin:0 0 6px}\
.mse-dim-name{font-weight:500;color:var(--text)}\
.mse-dim-ok{color:var(--success);font-weight:600}\
.mse-dim-warn{color:var(--warning);font-weight:600}\
.mse-dim-high{color:var(--danger);font-weight:600}\
.mse-dim-foot{margin-top:10px;padding:8px 12px;border-radius:8px;font-size:12px}\
.mse-dim-alert{background:rgba(239,68,68,.08);color:var(--danger)}\
.mse-dim-pass{background:rgba(34,197,94,.08);color:var(--success)}\
.mse-dim-wait{background:rgba(250,204,21,.1);color:#a16207}\
.mse-submit-overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:rgba(15,23,42,.6);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}\
.mse-submit-loading{background:var(--card-bg);border-radius:16px;padding:32px 40px;text-align:center;font-size:15px;color:var(--text);box-shadow:0 8px 40px rgba(0,0,0,.2)}\
.mse-submit-loading .spinner{width:36px;height:36px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:mseSpin .8s linear infinite;margin:0 auto 14px}\
@keyframes mseSpin{to{transform:rotate(360deg)}}\
.mse-suggestions{background:var(--hover-bg);border-radius:14px;padding:18px 20px;margin:12px 0;text-align:left;border:1px solid var(--border)}\
.mse-suggestions .s-title{font-size:15px;font-weight:600;color:var(--text);margin-bottom:10px}\
.mse-suggestions .s-item{font-size:13px;color:var(--text-light);padding:6px 0;border-bottom:1px solid var(--border);line-height:1.6}\
.mse-suggestions .s-item:last-child{border-bottom:none}\
.mse-suggestions .s-item .s-icon{margin-right:6px}\
.mse-section-row{display:flex;justify-content:space-between;padding:10px 14px;background:var(--hover-bg);border-radius:10px;font-size:13px}\
.mse-section-row .label{color:var(--text-light)}\
.mse-section-row .value{font-weight:700}\
.mse-confetti{position:relative;height:0;overflow:visible;pointer-events:none;z-index:10}\
.mse-confetti-dot{position:absolute;top:-10px;width:8px;height:8px;border-radius:50%;animation:mseConfettiFall 2.5s ease-out forwards;opacity:.9}\
@keyframes mseConfettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(280px) rotate(720deg);opacity:0}}\
.mse-result-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px}\
.mse-result-btn{min-height:44px;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600;border:1.5px solid var(--border);cursor:pointer;transition:all .2s;background:var(--card-bg);color:var(--text);text-decoration:none}\
.mse-result-btn.primary{background:linear-gradient(135deg,var(--header-start),var(--primary));color:#fff;border:none}\
.mse-result-btn.primary:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(var(--primary-rgb),.4)}\
.mse-wrong-item{padding:10px 12px;margin-bottom:8px;background:rgba(var(--warning-rgb),.08);border-radius:10px;border-left:4px solid var(--danger);text-align:left;font-size:13px}\
.mse-wrong-item .q{margin-bottom:4px}\
.mse-wrong-item .detail{color:var(--text-light);font-size:12px}\
.mse-wrong-item .user-ans{color:var(--danger);font-weight:600}\
.mse-wrong-item .correct-ans{color:var(--success);font-weight:600}\.mse-wrong-item .wrong-explain{color:var(--text-light);font-size:12px;margin-top:4px;padding-top:4px;border-top:1px solid var(--border)}\
.mse-wrong-section{font-size:14px;font-weight:700;margin:12px 0 6px;padding-bottom:4px;border-bottom:1px solid var(--border)}\
.mse-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:20px}\
.mse-modal{background:var(--card-bg);border-radius:14px;max-width:600px;width:100%;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,.2)}\
.mse-modal-header{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--border);font-size:16px;font-weight:600}\
.mse-modal-close{background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-light);width:44px;height:44px;display:flex;align-items:center;justify-content:center}\
.mse-modal-body{padding:14px 18px;overflow-y:auto;flex:1}\
.mse-finish-info{background:rgba(var(--success-rgb),.06);border-radius:10px;padding:20px;margin:16px 0;text-align:center}\
.mse-finish-info .big{font-size:36px}\
.mse-finish-info .stat{font-size:15px;color:var(--text);margin:8px 0}\
.mse-finish-info .warn{color:var(--danger);font-size:14px}\
.mse-multi-confirm{text-align:center;margin-top:12px}\
.mse-multi-confirm button{padding:8px 24px;border-radius:8px;border:none;font-size:14px;font-weight:600;cursor:pointer}\
.mse-multi-confirm .ok{background:var(--primary);color:#fff}\
@media(max-width:768px){\
.mse-container{padding:10px}\
.mse-q-area{padding:16px}\
.mse-q-text{font-size:16px;padding:12px}\
.mse-opt{padding:12px 14px}\
.mse-yesno-btn{padding:14px 12px;font-size:15px}\
.mse-yesno-btn .hint{display:none}\
.mse-grade-circle{width:90px;height:90px}\
.mse-grade-circle .letter{font-size:30px}\
.mse-transition{padding:24px 12px}\
.mse-modal{margin:10px;max-height:90vh}\
.mse-nav .mse-btn{flex:1}\
}';

window.MultiSectionEngine = {
  create: function(config){
    var C = {
      testId: config.testId || 'unknown',
      title: config.title || '测验',
      intro: config.intro || '',
      sections: config.sections || [],
      api: Object.assign({
        questions: '/api/questions/'+config.testId,
        submit: '/api/submit/'+config.testId,
        saveResult: '/'+config.testId+'/save-result'
      }, config.api || {}),
      mathConfig: config.mathConfig || { enabled: false, count: 0 },
      gradeLabels: config.gradeLabels || { A:'优秀', B:'良好', C:'合格', D:'待提高' },
      gradeThresholds: config.gradeThresholds || { A:90, B:75, C:60 },
    };

    var self = {
      _config: C,
      _phase: 'idle',
      _currentSection: 0,
      _currentQ: 0,
      _sectionAnswers: {},
      _sectionIndices: {},
      _questionsCache: {},
      _fallbackSections: {},
      _mathQuestions: [],
      _mathCorrect: [],
      _timerId: null,
      _elapsedTimerId: null,
      _startTime: null,
      _timeoutCount: 0,
      _isAnswered: false,
      _mathAdvancing: false,
      autoAdvance: true,
      _resultData: null,
      _shuffledOrder: {},
      _container: null,
      _el: {},
      _keyHandler: null,
      _saveTimer: null,
      _pageHandlersAdded: false,
      studyMode: false,

      _ensureStyles: function(){
        if(document.getElementById(STYLE_ID))return;
        var s=document.createElement('style');
        s.id=STYLE_ID;
        s.textContent=STYLES;
        document.head.appendChild(s);
      },

      _token: function(){
        var t=localStorage.getItem('miltest_token');
        return t;
      },

      _headers: function(){
        var h={
          'Content-Type':'application/json',
          'Authorization':'Bearer '+self._token()
        };
        var bankKey=null;
        try{bankKey=sessionStorage.getItem('elite_bank_key')}catch(e){}
        if(bankKey)h['x-bank-key']=bankKey;
        return h;
      },

      _isAuthError: function(d){
        if(!d||d.code==='KICKED'||d.msg==='请先登录'||d.msg==='登录已过期'||d.msg==='token已过期'||d.msg==='无效的token'){
          if(window.Auth&&Auth.isLoggedIn()){
            Auth.logout();
            localStorage.removeItem(self._storageKey());
            var p=location.pathname;
            if(p!=='/login')location.href='/login?redirect='+encodeURIComponent(p);
          }
          return true;
        }
        return false;
      },

      _totalQ: function(){
        var total=0;
        for(var i=0;i<C.sections.length;i++){
          total+=C.sections[i].count;
        }
        return total;
      },

      _storageKey: function(){
        return '_mse_'+C.testId+'_state';
      },

      _suggestedNextHtml: function(){
        var tid=C.testId, b='';
        if(tid==='cj-test'){
          b='<a href="/test1.html" class="mse-result-btn" style="flex:1;min-width:130px">🧠 MMPI人格心理</a><a href="/test2.html" class="mse-result-btn" style="flex:1;min-width:130px">📝 语言能力测试</a>';
        }else if(tid==='ww-test'){
          b='<a href="/test1.html" class="mse-result-btn" style="flex:1;min-width:115px">🧠 MMPI人格心理</a><a href="/test4.html" class="mse-result-btn" style="flex:1;min-width:115px">🎯 基本职业适应测试</a><a href="/test2.html" class="mse-result-btn" style="flex:1;min-width:115px">📝 语言能力测试</a><a href="/test3.html" class="mse-result-btn" style="flex:1;min-width:115px">📐 适应能力数学部分</a><a href="/test6.html" class="mse-result-btn" style="flex:1;min-width:115px">🔬 科学素养测验</a><a href="/test5.html" class="mse-result-btn" style="flex:1;min-width:115px">💪 抗压能力测试</a><a href="/test7.html" class="mse-result-btn" style="flex:1;min-width:115px">🎖️ 军事与生活常识</a><a href="/jx-test.html" class="mse-result-btn" style="flex:1;min-width:115px">⭐ 精选题库</a>';
        }
        if(!b) return '';
        return '<div style="margin-top:24px;padding-top:20px;border-top:2px solid var(--border);text-align:center"><h4 style="margin:0 0 12px;font-size:15px;color:var(--text)">🎯 建议继续练习</h4><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">'+b+'</div></div>';
      },

      mount: function(containerId){
        self._ensureStyles();
        var container=document.getElementById(containerId);
        if(!container){console.error('Container #'+containerId+' not found');return}
        self._container=container;
        container.className='mse-container';
        container.innerHTML='\
<div id="mse_welcome" class="mse-welcome">\
  <div class="icon">'+_html(C.sections[0]&&C.sections[0].icon||'📋')+'</div>\
  <h2>'+_html(C.title)+'</h2>\
  <div class="mse-desc-box" id="mse_desc"></div>\
  <button class="mse-btn green" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.begin()" style="padding:14px 48px;font-size:18px">🚀 开始测验</button>\
</div>\
<div id="mse_section" class="mse-hidden">\
  <div class="mse-header" id="mse_header"></div>\
  <div class="mse-progress"><div class="mse-progress-fill" id="mse_progress" style="width:0%"></div></div>\
  <div class="mse-q-area">\
    <div class="mse-timer-bar"><div class="mse-timer-fill" id="mse_timer" style="width:100%"></div></div>\
    <div class="mse-q-meta">\
      <div class="mse-q-num" id="mse_qnum"></div>\
      <div style="display:flex;align-items:center;gap:8px">\
        <div class="mse-elapsed" id="mse_elapsed">已用时: 00:00</div>\
        <label style="font-size:12px;color:var(--text-light);display:flex;align-items:center;gap:3px;cursor:pointer">\
          <input type="checkbox" id="mse_aa_cb" checked style="width:14px;height:14px;cursor:pointer">自动\
        </label>\
      </div>\
    </div>\
    <div class="mse-q-text" id="mse_qtext">加载中...</div>\
    <div id="mse_options"></div>\
    <div class="mse-nav" id="mse_nav"></div>\
  </div>\
</div>\
<div id="mse_transition" class="mse-hidden">\
  <div class="mse-transition">\
    <div class="icon" id="mse_t_icon">✅</div>\
    <h2 id="mse_t_title">完成本段</h2>\
    <p id="mse_t_desc"></p>\
    <div class="mse-next-info" id="mse_t_next">\
      <h3 id="mse_t_next_title">下一段</h3>\
      <p id="mse_t_next_desc"></p>\
    </div>\
    <button class="mse-btn primary" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.startNextSection()" style="padding:12px 36px;font-size:16px;margin-top:10px">继续</button>\
    <button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.skipNextSection()" style="margin-top:8px;padding:8px 24px;font-size:13px;background:rgba(var(--warning-rgb),.1);border-color:var(--warning);color:var(--warning)">跳过下一部分 →</button>\
  </div>\
</div>\
<div id="mse_finish" class="mse-hidden">\
  <div class="mse-welcome">\
    <div class="icon">📊</div>\
    <h2>测验完成</h2>\
    <div class="mse-finish-info" id="mse_finish_info"></div>\
    <button class="mse-btn green" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.submit()" style="padding:12px 48px;font-size:16px">提交结果</button>\
  </div>\
</div>\
<div id="mse_result" class="mse-hidden">\
  <div class="mse-result">\
    <h2>📋 测评结果</h2>\
    <div class="mse-grade-circle" id="mse_grade">\
      <div class="letter" id="mse_grade_letter">-</div>\
      <div class="desc" id="mse_grade_desc"></div>\
    </div>\
    <div style="font-size:18px;font-weight:700;margin:8px 0" id="mse_score"></div>\
    <div id="mse_emotion" class="mse-emotion-box"></div>\
    <div id="mse_analysis"></div>\
    <div id="mse_suggestions" class="mse-suggestions"></div>\
    <div id="mse_summary" class="mse-section-grid"></div>\
    <div class="mse-result-actions">\
      <button class="mse-result-btn primary" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.showWrong()">📝 错题回顾</button>\
      <a href="/" class="mse-result-btn">返回首页</a>\
      <button class="mse-result-btn" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.restart()">重新测试</button>\
    </div>\
    '+self._suggestedNextHtml()+'\
  </div>\
</div>\
<div id="mse_modal" class="mse-hidden">\
  <div class="mse-modal-overlay" onclick="if(event.target===this)MultiSectionEngine._inst&&MultiSectionEngine._inst.closeModal()">\
    <div class="mse-modal">\
      <div class="mse-modal-header"><span id="mse_modal_title">📝 错题回顾</span><button class="mse-modal-close" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.closeModal()">✕</button></div>\
      <div class="mse-modal-body" id="mse_modal_body"></div>\
    </div>\
  </div>\
</div>';
        self._el={welcome:container.querySelector('#mse_welcome'),section:container.querySelector('#mse_section'),transition:container.querySelector('#mse_transition'),finish:container.querySelector('#mse_finish'),result:container.querySelector('#mse_result'),modal:container.querySelector('#mse_modal'),header:container.querySelector('#mse_header'),progress:container.querySelector('#mse_progress'),timer:container.querySelector('#mse_timer'),qnum:container.querySelector('#mse_qnum'),elapsed:container.querySelector('#mse_elapsed'),qtext:container.querySelector('#mse_qtext'),options:container.querySelector('#mse_options'),nav:container.querySelector('#mse_nav'),tIcon:container.querySelector('#mse_t_icon'),tTitle:container.querySelector('#mse_t_title'),tDesc:container.querySelector('#mse_t_desc'),tNextTitle:container.querySelector('#mse_t_next_title'),tNextDesc:container.querySelector('#mse_t_next_desc'),finishInfo:container.querySelector('#mse_finish_info'),gradeCircle:container.querySelector('#mse_grade'),gradeLetter:container.querySelector('#mse_grade_letter'),gradeDesc:container.querySelector('#mse_grade_desc'),score:container.querySelector('#mse_score'),summary:container.querySelector('#mse_summary'),emotion:container.querySelector('#mse_emotion'),analysis:container.querySelector('#mse_analysis'),suggestions:container.querySelector('#mse_suggestions'),modalTitle:container.querySelector('#mse_modal_title'),modalBody:container.querySelector('#mse_modal_body')};
        var aaCb=document.getElementById('mse_aa_cb');
        if(aaCb)aaCb.onchange=function(){self.autoAdvance=this.checked};
        self._buildDesc();
        if(window.StudyMode&&StudyMode.isSupported(C.testId)){
          ApiClient.get('/questions/info').then(function(infoData){
            if(infoData&&infoData.success&&infoData.data&&infoData.data.closed&&infoData.data.closed.indexOf(C.testId)>=0){
              StudyMode.renderClosed(container.querySelector('#mse_welcome'));
            }else{
              StudyMode.injectToggle(container.querySelector('#mse_welcome'),C.testId);
            }
          }).catch(function(){StudyMode.injectToggle(container.querySelector('#mse_welcome'),C.testId);});
        }
        window.MultiSectionEngine._inst=self;
        self._restoreState();
      },

      _buildDesc: function(){
        var skipped=self._skippedSections||{};
        var allSkipped=true;
        var html=(C.intro ? '<div class="mse-intro" style="margin-bottom:12px;padding:12px 14px;background:var(--hover-bg);border-radius:10px;font-size:13px;line-height:1.75;color:var(--text-light);text-align:left">'+C.intro+'</div>' : '');
        html+='<b>'+_html(C.title)+'<br>'+_html(C.sections.length)+'个模块：</b><br>';
        for(var i=0;i<C.sections.length;i++){
          var s=C.sections[i];
          var isSkipped=!!skipped[i];
          var skipStyle=isSkipped?'text-decoration:line-through;opacity:.5;':'';
          html+='<br><span style="'+skipStyle+'">'+(i+1)+'. '+_html(s.icon||'')+' <b>'+_html(s.name)+'</b>';
          if(s.desc) html+='：'+_html(s.desc);
          if(s.count) html+='（'+s.count+'题）';
          html+='</span> <label style="font-size:12px;color:var(--text-light);cursor:pointer;user-select:none;margin-left:4px">'
            +'<input type="checkbox" onchange="MultiSectionEngine._inst&&MultiSectionEngine._inst.toggleSkip('+i+',this.checked)" '+(isSkipped?'checked':'')+' style="width:14px;height:14px;vertical-align:middle;cursor:pointer"> '
            +'<span style="vertical-align:middle">跳过</span></label>';
          if(!isSkipped)allSkipped=false;
        }
        html+='<br><br><b>💡 注意事项</b><br>• 答题过程中请勿刷新页面<br>• 每题限时作答，超时将自动跳转<br>• 请根据真实情况作答，不要前后矛盾';
        if(C.testId==='cj-test')html+='<br><br><div style="font-size:13px;color:var(--text-light);line-height:1.7;padding:10px 12px;background:var(--hover-bg);border-radius:8px">📋 <b>结果判定说明（参照医院机检标准）</b><br>• <b>1类</b>：数学、言语达标，心理无异常 —— 机检合格<br>• <b>2类</b>：数学做错较多（正确率&lt;90%）—— 需加做纸笔智力测验<br>• <b>3类</b>：心理有问题或言语错误较多（正确率&lt;75%）—— 需人工心理访谈<br>本结果为模拟参考，非官方结论，请以实际征兵检测为准。</div>';
        if(allSkipped)html+='<br><br><div style="color:var(--danger);font-weight:600;font-size:14px;padding:8px 12px;background:rgba(var(--danger-rgb),.08);border-radius:8px">⚠ 您已选择跳过所有模块，请至少保留一个模块作答</div>';
        var el=document.getElementById('mse_desc');
        if(el)el.innerHTML=html;
      },

      toggleSkip: function(secIdx, checked){
        self._skippedSections=self._skippedSections||{};
        if(checked){
          self._skippedSections[secIdx]=true;
        }else{
          delete self._skippedSections[secIdx];
        }
        self._buildDesc();
      },

      begin: function(){
        if(typeof Auth==='undefined'||!Auth.isLoggedIn()){location.href='/login?redirect=/'+C.testId+'.html';return}
        var cu=Auth.getCurrentUser();
        if(cu&&(cu.account_type==='trial'||cu.account_type==='agent')){location.href='/upgrade?redirect=/'+C.testId+'.html';return}
        var studyCb=document.getElementById('_studyToggle');
        self.studyMode=!!(studyCb&&studyCb.checked);
        if(window.StudyMode)StudyMode.setMode(C.testId,self.studyMode);
        self._startTime=Date.now();
        self._timeoutCount=0;
        self._sectionAnswers={};
        self._sectionIndices={};
        self._questionsCache={};
        self._fallbackSections={};
        self._shuffledOrder={};
        self._mathQuestions=[];
        self._mathCorrect=[];
        // Pre-fill skipped sections from welcome page
        var skipped=self._skippedSections||{};
        for(var si=0;si<C.sections.length;si++){
          if(skipped[si]){
            var sc=C.sections[si];
            var scnt=sc.count||0;
            self._sectionAnswers[si]=new Array(scnt).fill(-1);
            self._shuffledOrder[si]=[];
            self._questionsCache[si]=[];
          }
        }
        self._currentSection=0;
        self._currentQ=0;
        self._showPhase('section');
        self._clearElapsed();
        self._elapsedTimerId=setInterval(self._updateElapsed,1000);
        if(C.mathConfig.enabled)self._genMath();
        if(!self._pageHandlersAdded){
          self._pageHandlersAdded=true;
          document.addEventListener('visibilitychange',function(){if(document.hidden)self._saveNow();});
          window.addEventListener('pagehide',function(){self._saveNow();});
        }
        self._loadSection(0);
        self._bindKeyboard();
      },

      _studyStats: function(){
        var stats={total:0,answered:0,correct:0,wrong:0,skipped:0,judged:0};
        for(var si=0;si<C.sections.length;si++){
          var sec=C.sections[si];
          var ansArr=self._sectionAnswers[si]||[];
          var order=(self._shuffledOrder[si]||[]);
          if(sec.type==='math'&&C.mathConfig.enabled){
            var mc=C.mathConfig.count;
            for(var mi=0;mi<mc;mi++){
              stats.total++;
              var ma=ansArr[mi];
              if(typeof ma!=='number'||ma<0){stats.skipped++;continue}
              stats.answered++;
              stats.judged++;
              if(self._mathCorrect[mi]===ma)stats.correct++;else stats.wrong++;
            }
            continue;
          }
          var qs=self._questionsCache[si]||[];
          for(var qi=0;qi<qs.length;qi++){
            stats.total++;
            var cachePos=(order[qi]!==undefined)?order[qi]:qi;
            var q=qs[cachePos];
            var a=ansArr[qi];
            if(!q){stats.skipped++;continue}
            var answeredFlag=Array.isArray(a)?a.length>0:(typeof a==='number'&&a>=0);
            if(!answeredFlag){stats.skipped++;continue}
            stats.answered++;
            if(q.ans===undefined||q.ans===null)continue;
            stats.judged++;
            if(window.StudyMode&&StudyMode.isCorrect(q,a))stats.correct++;else stats.wrong++;
          }
        }
        return stats;
      },

      _finishStudy: function(){
        localStorage.removeItem(self._storageKey());
        self._clearTimer();
        self._clearElapsed();
        self._sectionAnswers={};
        self._sectionIndices={};
        self._questionsCache={};
        self._fallbackSections={};
        self._shuffledOrder={};
        self._mathQuestions=[];
        self._mathCorrect=[];
        self._currentSection=0;
        self._currentQ=0;
        self._timeoutCount=0;
        self.studyMode=false;
        if(window.StudyMode)StudyMode.exitStudy();
        self._showPhase('welcome');
        if(window.showToast)showToast('背题完成！','success');
      },

      restart: function(){
        localStorage.removeItem(self._storageKey());
        self._sectionAnswers={};
        self._sectionIndices={};
        self._questionsCache={};
        self._shuffledOrder={};
        self._mathQuestions=[];
        self._mathCorrect=[];
        self._mathAdvancing=false;
        self._currentSection=0;
        self._currentQ=0;
        self._clearTimer();
        self._clearElapsed();
        self._showPhase('welcome');
      },

      _showPhase: function(phase){
        var ids=['welcome','section','transition','finish','result','modal'];
        for(var i=0;i<ids.length;i++){
          var el=self._el[ids[i]];
          if(el)el.classList.toggle('mse-hidden',ids[i]!==phase);
        }
      },

      _genMath: function(){
        var count=C.mathConfig.count;
        var ops=C.mathConfig.operators||['+'];
        if(!count)return;
        self._mathQuestions=[];
        self._mathCorrect=[];
        for(var i=0;i<count;i++){
          var op=ops[_rand(0,ops.length-1)];
          var a,b,ans,result;
          if(op==='+'){
            a=_rand(10,99);b=_rand(10,99);result=a+b;ans=result%10;
          }else{
            b=_rand(10,99);result=_rand(10,99);a=b+result;ans=result%10;
          }
          self._mathQuestions.push({a:a,b:b,op:op,ans:ans,result:result});
          self._mathCorrect.push(ans);
        }
      },

      _loadSection: function(sectionIdx, startQ){
        var sec=C.sections[sectionIdx];
        if(!sec)return;
        if(startQ===undefined)startQ=0;
        self._currentQ=startQ;
        // Auto-skip if this section was pre-marked as skipped
        var ansArr=self._sectionAnswers[sectionIdx];
        if(ansArr&&ansArr.length>0){
          var allSkipped=true;
          for(var ai=0;ai<ansArr.length;ai++){if(ansArr[ai]!==-1){allSkipped=false;break;}}
          if(allSkipped){self.startNextSection();return;}
        }
        if(sec.type==='math'&&C.mathConfig.enabled){
          if(!self._sectionAnswers[sectionIdx]||self._sectionAnswers[sectionIdx].length!==C.mathConfig.count){
            self._sectionAnswers[sectionIdx]=new Array(C.mathConfig.count).fill(-1);
          }
          self._renderQuestion();
          return;
        }
        var cached=self._questionsCache[sectionIdx];
        if(cached&&cached.length>0){
          self._renderQuestion();
          return;
        }
        self._questionsCache[sectionIdx]=null;
        var qtext=self._el.qtext;
        if(qtext)qtext.textContent='加载题库中...';
        fetch(C.api.pickSection,{
          method:'POST',
          headers:self._headers(),
          body:JSON.stringify({sectionIdx:sectionIdx,count:sec.count,mode:self.studyMode?'study':undefined})
        }).then(function(r){return r.json()}).then(function(d){
          if(self._isAuthError(d))return;
          if(d.success&&d.data){
            self._questionsCache[sectionIdx]=d.data.questions;
            self._sectionIndices[sectionIdx]=d.data.indices;
            if(!self._sectionAnswers[sectionIdx]){
              self._sectionAnswers[sectionIdx]=new Array(d.data.questions.length).fill(-1);
            }
            self._shuffleSection(sectionIdx);
          }else{
            self._questionsCache[sectionIdx]=self._genFallback(sec);
            self._sectionIndices[sectionIdx]=[];
            self._fallbackSections[sectionIdx]=true;
          }
          self._renderQuestion();
        }).catch(function(){
          self._questionsCache[sectionIdx]=self._genFallback(sec);
          self._sectionIndices[sectionIdx]=[];
          self._fallbackSections[sectionIdx]=true;
          self._renderQuestion();
        });
      },

      _shuffleSection: function(sectionIdx){
        var qs=self._questionsCache[sectionIdx];
        if(!qs||qs.length===0)return;
        var sec=C.sections[sectionIdx];
        if(sec&&sec.type==='math')return;

        // Check if questions have subtypes → per-subtype grouping
        var hasSubtypes=false;
        for(var si=0;si<qs.length&&si<5;si++){if(qs[si]&&qs[si].subtype){hasSubtypes=true;break;}}

        if(!hasSubtypes){
          var order=qs.map(function(_,i){return i});
          _shuffle(order);
          self._shuffledOrder[sectionIdx]=order;
          return;
        }

        // Per-subtype: group ALL same-subtype questions together, then shuffle within each group.
        // This ensures users finish one 题型 before the next, regardless of API/bank order.
        var groupMap={}, groupOrder=[];
        for(var si=0;si<qs.length;si++){
          var st=qs[si]&&qs[si].subtype||'其他';
          if(!groupMap[st]){groupMap[st]=[];groupOrder.push(st);}
          groupMap[st].push(si);
        }
        var finalOrder=[];
        for(var gi=0;gi<groupOrder.length;gi++){
          _shuffle(groupMap[groupOrder[gi]]);
          for(var ki=0;ki<groupMap[groupOrder[gi]].length;ki++){
            finalOrder.push(groupMap[groupOrder[gi]][ki]);
          }
        }
        self._shuffledOrder[sectionIdx]=finalOrder;
      },

      _genFallback: function(sec){
        var arr=[];
        for(var i=0;i<sec.count;i++){
          arr.push({q:'网络异常，题目加载失败。请点击「重试」或返回后重新进入，若持续失败可更换网络后再试。',opts:['A. 重新加载','B. 重试','C. 跳过'],type:'choice'});
        }
        return arr;
      },

      _renderQuestion: function(){
        self._container.scrollTop=0;window.scrollTo(0,0);
        var sec=C.sections[self._currentSection];
        if(!sec)return;
        var qIdx=self._currentQ;
        var actualCount=(self._shuffledOrder&&self._shuffledOrder[self._currentSection]&&self._shuffledOrder[self._currentSection].length)||sec.count;
        if(qIdx>=actualCount){
          self._showTransition();
          return;
        }
        self._isAnswered=false;
        var cachePos=(self._shuffledOrder&&self._shuffledOrder[self._currentSection]&&self._shuffledOrder[self._currentSection][qIdx]!==undefined)?self._shuffledOrder[self._currentSection][qIdx]:qIdx;
        var bar=self._el.progress;
        if(bar){
          var pct=actualCount>0?Math.round((qIdx+1)/actualCount*100):0;
          bar.style.width=pct+'%';
        }
        var num=self._el.qnum;
        if(num)num.textContent='第 '+(qIdx+1)+' 题（共 '+actualCount+' 题）';
        self._updateHeader();
        if(self._el.timer)self._el.timer.style.display=self.studyMode?'none':'';
        if(!self.studyMode)self._startTimer(sec.timePerQ||20);
        var _mfb=document.getElementById('mse_study_feedback'); if(_mfb&&_mfb.parentNode)_mfb.parentNode.removeChild(_mfb);

        if(sec.type==='math'&&C.mathConfig.enabled){
          self._renderMath(qIdx);
          return;
        }

        var questions=self._questionsCache[self._currentSection];
        var q=null;
        if(questions&&cachePos<questions.length){
          q=questions[cachePos];
          if(num&&q&&q.subtype){
            num.textContent='第 '+(qIdx+1)+' 题（共 '+actualCount+' 题） · '+q.subtype;
          }
          if(sec.type!=='math'&&sec.type!=='display'&&self._sectionAnswers[self._currentSection]&&typeof self._sectionAnswers[self._currentSection][qIdx]!=='undefined'&&self._sectionAnswers[self._currentSection][qIdx]>=0){
            // 已有答案，保留选中样式即可，不设 _isAnswered 以免阻塞操作
          }
        }
        if(!q){
          self._loadSingleQuestion(cachePos);
          return;
        }

        var qtext=self._el.qtext;
        if(qtext){
          var qHtml='';
          if(q.subtype)qHtml+='<span style="display:inline-block;background:rgba(var(--accent-rgb),.1);color:var(--accent-dark);font-size:12px;font-weight:600;padding:3px 10px;border-radius:12px;margin-bottom:8px">'+_html(q.subtype)+'</span>';
          qHtml+=MathRender.render(q.q||'题目加载中...');
          qtext.innerHTML=qHtml;
        }
        var optsDiv=self._el.options;
        optsDiv.innerHTML='';

        switch(q.type||sec.type||'choice'){
          case 'judge':
            self._renderJudge(q,self._currentSection,qIdx);
            break;
          case 'choice':
            self._renderChoice(q,self._currentSection,qIdx);
            break;
          case 'likert5':
          case 'likert':
            self._renderLikert(q,self._currentSection,qIdx);
            break;
          case 'multi':
            self._renderMulti(q,self._currentSection,qIdx);
            break;
          case 'display':
            self._isAnswered=true;
            if(!self._sectionAnswers[self._currentSection])self._sectionAnswers[self._currentSection]=new Array(sec.count).fill(-1);
            self._sectionAnswers[self._currentSection][qIdx]=0;
            if(qtext)qtext.textContent=q.q||'';
            optsDiv.innerHTML='<div style="margin-top:16px;padding:12px 16px;background:rgba(var(--accent-rgb),.06);border-radius:10px;text-align:center"><button class="mse-btn green" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst._advance()" style="padding:10px 32px;font-size:15px">继续 →</button></div>';
            self._clearTimer();
            break;
          default:
            self._renderChoice(q,self._currentSection,qIdx);
        }
        if(self.studyMode&&q&&q.type!=='display'&&self._sectionAnswers[self._currentSection]&&typeof self._sectionAnswers[self._currentSection][qIdx]!=='undefined'&&(Array.isArray(self._sectionAnswers[self._currentSection][qIdx])?self._sectionAnswers[self._currentSection][qIdx].length>0:self._sectionAnswers[self._currentSection][qIdx]>=0)){
          self._renderStudyFeedback(self._currentSection,qIdx);
        }
      },

      _loadSingleQuestion: function(cachePos){
        var secIdx=self._currentSection;
        var actualCount=(self._shuffledOrder[secIdx]&&self._shuffledOrder[secIdx].length)||(C.sections[secIdx]&&C.sections[secIdx].count)||0;
        if(cachePos>=actualCount){
          self._showTransition();
          return;
        }
        var qtext=self._el.qtext;
        if(qtext)qtext.textContent='加载中...';
        var secIdx=self._currentSection;
        var indicesArr=self._sectionIndices[secIdx];
        var dbIdx=(indicesArr&&indicesArr[cachePos]!==undefined)?indicesArr[cachePos]:cachePos;
        fetch(C.api.questions+'?idx='+dbIdx+(self.studyMode?'&mode=study':''),{headers:self._headers()})
          .then(function(r){return r.json()})
          .then(function(d){
            if(self._isAuthError(d))return;
            if(d.success&&d.data){
              var q=d.data.question;
              if(!q){
                if(qtext)qtext.textContent='题目数据异常，请刷新页面后重试';
                return;
              }
              if(!self._questionsCache[secIdx])self._questionsCache[secIdx]=[];
              self._questionsCache[secIdx][cachePos]=q;
              self._renderQuestion();
            }else{
              if(qtext)qtext.textContent=(window.Utils&&Utils.netTip)?Utils.netTip():'网络异常，请更换优质的网络环境后再试';
            }
          })
          .catch(function(){
            if(qtext)qtext.textContent=(window.Utils&&Utils.netTip)?Utils.netTip():'网络异常，请更换优质的网络环境后再试';
          });
      },

      _renderJudge: function(q,secIdx,qIdx){
        var optsDiv=self._el.options;
        var labels=['是','否'];
        var vals=[0,1];
        var keys=['1','2'];
        var selfAns=self._sectionAnswers[secIdx]?self._sectionAnswers[secIdx][qIdx]:-1;
        for(var i=0;i<2;i++){
          var btn=document.createElement('div');
          btn.className='mse-yesno-btn'+(selfAns===vals[i]?' selected':'');
          btn.textContent=labels[i];
          var hint=document.createElement('span');hint.className='hint';hint.textContent='按键 '+keys[i];
          btn.appendChild(hint);
          btn._val=vals[i];
          btn.onclick=function(){if(self._isAnswered)return;self._selectAnswer(this._val,secIdx,qIdx);};
          optsDiv.appendChild(btn);
        }
        var nav=self._el.nav;
        var prevBtn=self._currentQ>0?'<button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.back()" style="margin-right:auto">← 上一题</button>':'';
        nav.innerHTML=prevBtn
          +'<button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.skip()">跳过</button>'
          +'<button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.skipSection()" style="margin-left:8px;background:rgba(var(--warning-rgb),.1);border-color:var(--warning);color:var(--warning)">跳过本部分</button>';
      },

      _renderLikert: function(q,secIdx,qIdx){
        var opts=q.opts||[];
        var optsDiv=self._el.options;
        var selfAns=self._sectionAnswers[secIdx]?self._sectionAnswers[secIdx][qIdx]:-1;
        var likert=[];
        opts.forEach(function(o,i){ likert.push({i:i,label:o}); });
        likert.forEach(function(it){
          var div=document.createElement('div');
          div.className='mse-opt mse-likert'+(selfAns===it.i?' selected':'');
          var radio=document.createElement('div');radio.className='radio';
          var lb=document.createElement('span');lb.className='label';lb.textContent=String(it.i+1);
          var tx=document.createElement('span');tx.className='text';tx.innerHTML=MathRender.render(it.label);
          div.append(radio,lb,tx);
          div._val=it.i;
          div.onclick=function(){if(self._isAnswered)return;self._selectAnswer(this._val,secIdx,qIdx);};
          optsDiv.appendChild(div);
        });
        var nav=self._el.nav;
        var prevBtn=self._currentQ>0?'<button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.back()" style="margin-right:auto">← 上一题</button>':'';
        nav.innerHTML=prevBtn
          +'<button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.skip()">跳过</button>'
          +'<button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.skipSection()" style="margin-left:8px;background:rgba(var(--warning-rgb),.1);border-color:var(--warning);color:var(--warning)">跳过本部分</button>';
      },

      _renderChoice: function(q,secIdx,qIdx){
        var opts=q.opts||[];
        var optsDiv=self._el.options;
        var labels=['A','B','C','D','E','F','G','H'];
        var selfAns=self._sectionAnswers[secIdx]?self._sectionAnswers[secIdx][qIdx]:-1;
        for(var i=0;i<opts.length;i++){
          var div=document.createElement('div');
          div.className='mse-opt'+(selfAns===i?' selected':'');
          var radio=document.createElement('div');radio.className='radio';
          var lb=document.createElement('span');lb.className='label';lb.textContent=labels[i]||'';
          var tx=document.createElement('span');tx.className='text';tx.innerHTML=MathRender.render(opts[i]);
          div.append(radio,lb,tx);
          div._idx=i;
          div.onclick=function(){if(self._isAnswered)return;self._selectAnswer(this._idx,secIdx,qIdx);};
          optsDiv.appendChild(div);
        }
        var nav=self._el.nav;
        var prevBtn=self._currentQ>0?'<button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.back()" style="margin-right:auto">← 上一题</button>':'';
        nav.innerHTML=prevBtn
          +'<button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.skip()">跳过</button>'
          +'<button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.skipSection()" style="margin-left:8px;background:rgba(var(--warning-rgb),.1);border-color:var(--warning);color:var(--warning)">跳过本部分</button>';
      },

      _renderMulti: function(q,secIdx,qIdx){
        var opts=q.opts||[];
        var optsDiv=self._el.options;
        var labels=['A','B','C','D','E','F','G','H'];
        var selected=self._sectionAnswers[secIdx]?self._sectionAnswers[secIdx][qIdx]:[];
        if(!Array.isArray(selected))selected=[];
        for(var i=0;i<opts.length;i++){
          var div=document.createElement('div');
          div.className='mse-opt'+(selected.indexOf(i)>=0?' selected':'');
          var cb=document.createElement('div');cb.className='cb';cb.textContent=selected.indexOf(i)>=0?'✓':'';
          var lb=document.createElement('span');lb.className='label';lb.textContent=labels[i]||'';
          var tx=document.createElement('span');tx.className='text';tx.innerHTML=MathRender.render(opts[i]);
          div.append(cb,lb,tx);
          div._idx=i;
          div.onclick=function(){
            if(!self._sectionAnswers[secIdx])self._sectionAnswers[secIdx]=new Array(C.sections[secIdx].count).fill(-1);
            var arr=self._sectionAnswers[secIdx][qIdx];
            if(!Array.isArray(arr))arr=[];
            var pos=arr.indexOf(this._idx);
            if(pos>=0){arr.splice(pos,1)}else{arr.push(this._idx)}
            arr.sort();
            self._sectionAnswers[secIdx][qIdx]=arr;
            optsDiv.querySelectorAll('.mse-opt').forEach(function(el,i){
              el.classList.toggle('selected',arr.indexOf(i)>=0);
              var cbEl=el.querySelector('.cb');
              if(cbEl)cbEl.textContent=arr.indexOf(i)>=0?'✓':'';
            });
          };
          optsDiv.appendChild(div);
        }
        var nav=self._el.nav;
        nav.innerHTML='<div class="mse-multi-confirm"><button class="mse-btn primary ok" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.confirmMulti('+secIdx+','+qIdx+')">确认选择</button></div>';
      },

      _renderStudyFeedback: function(secIdx,qIdx){
        var cachePos=(self._shuffledOrder[secIdx]&&self._shuffledOrder[secIdx][qIdx]!==undefined)?self._shuffledOrder[secIdx][qIdx]:qIdx;
        var q=(self._questionsCache[secIdx]||[])[cachePos];
        if(!q)return;
        var optsDiv=self._el.options;
        var existing=document.getElementById('mse_study_feedback');
        if(existing&&existing.parentNode)existing.parentNode.removeChild(existing);
        var div=document.createElement('div');
        div.id='mse_study_feedback';
        div.innerHTML=window.StudyMode?StudyMode.feedbackHtml(q,self._sectionAnswers[secIdx]?self._sectionAnswers[secIdx][qIdx]:-1):'';
        if(optsDiv&&optsDiv.parentNode)optsDiv.parentNode.insertBefore(div,optsDiv.nextSibling);
      },

      _renderMathFeedback: function(qIdx){
        var q=self._mathQuestions[qIdx];
        if(!q)return;
        var optsDiv=self._el.options;
        var existing=document.getElementById('mse_study_feedback');
        if(existing&&existing.parentNode)existing.parentNode.removeChild(existing);
        var div=document.createElement('div');
        div.id='mse_study_feedback';
        div.style.cssText='margin-top:16px;padding:14px 16px;background:#f0fdf4;border:1px solid #22c55e;border-radius:12px;font-size:14px;line-height:1.7';
        var correct=q.result%10;
        div.innerHTML='<div style="font-weight:700;color:#22c55e;margin-bottom:6px">✅ 正确答案</div><div style="color:#0F172A"><strong>'+q.a+' '+(q.op||'+')+' '+q.b+' = '+q.result+'</strong>（个位 '+correct+'）</div>';
        if(optsDiv&&optsDiv.parentNode)optsDiv.parentNode.insertBefore(div,optsDiv.nextSibling);
      },

      _selectAnswer: function(val,secIdx,qIdx){
        if(!self._sectionAnswers[secIdx])self._sectionAnswers[secIdx]=new Array(C.sections[secIdx].count).fill(-1);
        self._sectionAnswers[secIdx][qIdx]=val;
        self._clearTimer();
        var optsDiv=self._el.options;
        optsDiv.querySelectorAll('.mse-yesno-btn,.mse-opt').forEach(function(el){
          el.classList.toggle('selected',el._val===val||el._idx===val);
        });
        if(self.studyMode){
          self._isAnswered=true;
          self._renderStudyFeedback(secIdx,qIdx);
          self._showNextBtn();
          return;
        }
        if(self.autoAdvance){
          self._isAnswered=true;
          setTimeout(function(){self._advance()},250);
        }else{
          self._showNextBtn();
        }
      },

      confirmMulti: async function(secIdx,qIdx){
        var arr=self._sectionAnswers[secIdx]?self._sectionAnswers[secIdx][qIdx]:[];
        if(!Array.isArray(arr)||arr.length===0){
          if(!(await UiKit.confirm('提示','尚未选择任何选项，确定跳过？')))return;
        }
        self._isAnswered=true;
        self._clearTimer();
        if(self.studyMode){
          self._renderStudyFeedback(secIdx,qIdx);
          self._showNextBtn();
          return;
        }
        setTimeout(function(){self._advance()},200);
      },

      skip: function(){
        if(self._isAnswered)return;
        self._isAnswered=true;
        self._clearTimer();
        self._advance();
      },

      back: function(){
        if(self._currentQ<=0)return;
        self._clearTimer();
        self._currentQ--;
        self._saveState();
        self._renderQuestion();
      },

      skipSection: function(){
        var secIdx=self._currentSection;
        var sec=C.sections[secIdx];
        if(!sec)return;
        self._clearTimer();
        var actualCount=(self._shuffledOrder[secIdx]&&self._shuffledOrder[secIdx].length)||sec.count;
        if(!self._sectionAnswers[secIdx]){
          self._sectionAnswers[secIdx]=[];
        }
        for(var i=0;i<actualCount;i++){
          if(self._sectionAnswers[secIdx][i]===undefined||self._sectionAnswers[secIdx][i]===null){
            self._sectionAnswers[secIdx][i]=-1;
          }
        }
        self._saveState();
        self.startNextSection();
      },

      skipNextSection: function(){
        var secIdx=self._currentSection;
        // Find next non-skipped section
        var nextIdx=-1;
        for(var nsi=secIdx+1;nsi<C.sections.length;nsi++){
          var nsAns=self._sectionAnswers[nsi];
          if(nsAns&&nsAns.length>0){
            var allSkip=true;
            for(var ai=0;ai<nsAns.length;ai++){if(nsAns[ai]!==-1){allSkip=false;break;}}
            if(allSkip)continue;
          }
          nextIdx=nsi;
          break;
        }
        if(nextIdx<0||nextIdx>=C.sections.length)return;
        var sec=C.sections[nextIdx];
        var count=sec.count||0;
        self._sectionAnswers[nextIdx]=new Array(count).fill(-1);
        self._shuffledOrder[nextIdx]=[];
        self._questionsCache[nextIdx]=[];
        self._saveState();
        self._showTransition();
      },

      _showNextBtn: function(){
        var nav=self._el.nav;
        if(nav){
          var prevBtn=self._currentQ>0?'<button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.back()" style="margin-right:auto">← 上一题</button>':'';
          nav.innerHTML=prevBtn
            +'<button class="mse-btn green" onclick="MultiSectionEngine._inst&&(MultiSectionEngine._inst._isAnswered=true)&&MultiSectionEngine._inst._advance()">下一题 →</button>'
            +'<button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.skip()" style="margin-left:8px">跳过</button>'
            +'<button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.skipSection()" style="margin-left:8px;background:rgba(var(--warning-rgb),.1);border-color:var(--warning);color:var(--warning)">跳过本部分</button>';
        }
      },

      _advance: function(){
        self._currentQ++;
        self._saveState();
        var sec=C.sections[self._currentSection];
        var actualCount=(self._shuffledOrder&&self._shuffledOrder[self._currentSection]&&self._shuffledOrder[self._currentSection].length)||sec.count;
        if(self._currentQ>=actualCount){
          self._showTransition();
          return;
        }
        self._renderQuestion();
      },

      _showTransition: function(){
        self._container.scrollTop=0;window.scrollTo(0,0);
        self._clearTimer();
        var secIdx=self._currentSection;
        var sec=C.sections[secIdx];
        if(!sec)return;
        // Find next non-skipped section
        var nextSec=null, nextSecIdx=-1;
        for(var nsi=secIdx+1;nsi<C.sections.length;nsi++){
          var nsa=self._sectionAnswers[nsi];
          if(nsa&&nsa.length>0){
            var nsAllSkipped=true;
            for(var nai=0;nai<nsa.length;nai++){if(nsa[nai]!==-1){nsAllSkipped=false;break;}}
            if(nsAllSkipped)continue;
          }
          nextSec=C.sections[nsi];
          nextSecIdx=nsi;
          break;
        }
        var answered=0;
        var ansArr=self._sectionAnswers[secIdx];
        if(ansArr){
          for(var i=0;i<ansArr.length;i++){
            if(ansArr[i]!==undefined&&ansArr[i]>=0&&ansArr[i]!==-1&&!(Array.isArray(ansArr[i])&&ansArr[i].length===0))answered++;
          }
        }
        var iconEl=self._el.tIcon;
        if(iconEl)iconEl.textContent=sec.icon||'✅';
        var tTitle=self._el.tTitle;
        if(tTitle)tTitle.textContent='已完成「'+sec.name+'」';
        var tDesc=self._el.tDesc;
        var actualCount=(self._shuffledOrder[secIdx]&&self._shuffledOrder[secIdx].length)||sec.count;
        if(tDesc)tDesc.textContent='完成 '+answered+'/'+actualCount+' 题';
        if(nextSec){
          var nt=self._el.tNextTitle;
          if(nt)nt.textContent='下一段：'+(nextSec.icon||'')+' '+nextSec.name;
          var nd=self._el.tNextDesc;
          if(nd)nd.textContent=(nextSec.desc||'')+'（共 '+nextSec.count+' 题，每题限时 '+(nextSec.timePerQ||20)+' 秒）';
          // Show skip-next button only if this isn't the last non-skipped section
          var skipBtn=document.querySelector('#mse_transition .mse-btn.warning');
          if(skipBtn)skipBtn.style.display=nextSec?'inline-block':'none';
        }else{
          var nt2=self._el.tNextTitle;
          if(nt2)nt2.textContent='所有模块已完成';
          var nd2=self._el.tNextDesc;
          if(nd2)nd2.textContent='请准备提交测验结果';
        }
        self._showPhase('transition');
      },

      startNextSection: function(){
        var secIdx=self._currentSection;
        if(secIdx<C.sections.length-1){
          self._currentSection++;
          self._currentQ=0;
          self._showPhase('section');
          self._loadSection(self._currentSection);
        }else{
          self._showFinish();
        }
      },

      _showFinish: function(){
        self._clearTimer();
        if(self.studyMode){
          self._showPhase('finish');
          var total=self._totalQ();
          var st=self._studyStats();
          var info=self._el.finishInfo;
          if(info)info.innerHTML='<div class="big">📖</div><div class="stat">背题完成！已浏览全部 '+total+' 题</div>' +
            '<div class="stat" style="display:flex;justify-content:center;gap:22px;font-size:14px"><span>答对 <b style="color:#22c55e">'+st.correct+'</b></span><span>答错 <b style="color:#ef4444">'+st.wrong+'</b></span>'+(st.skipped>0?'<span>未答 <b>'+st.skipped+'</b></span>':'')+'</div>' +
            '<div class="stat">背题模式不记录成绩，可随时重练</div>';
          var btn=self._el.finish?self._el.finish.querySelector('.mse-btn'):null;
          if(btn){btn.textContent='返回开始';btn.setAttribute('onclick','MultiSectionEngine._inst&&MultiSectionEngine._inst._finishStudy()');}
          return;
        }
        self._showPhase('finish');
        var total=self._totalQ();
        var unanswered=0;
        for(var secI=0;secI<C.sections.length;secI++){
          var ansArr=self._sectionAnswers[secI];
          if(ansArr){
            for(var qi=0;qi<ansArr.length;qi++){
              var a=ansArr[qi];
              if(a===undefined||a===null||a===-1||a===''||(Array.isArray(a)&&a.length===0))unanswered++;
            }
          }
        }
        var info=self._el.finishInfo;
        if(info){
          var html='<div class="big">🎉</div><div class="stat">已完成全部 '+C.sections.length+' 个模块，共 '+total+' 题</div>';
          if(unanswered>0)html+='<div class="warn">⚠ 还有 '+unanswered+' 道题未作答</div>';
          html+='<div class="stat">⏱ 总用时：<span id="mse_finish_time">00:00</span></div>';
          info.innerHTML=html;
        }
        self._updateElapsed();
      },

      submit: async function(){
        if(self.studyMode){self._finishStudy();return;}
        var total=self._totalQ();
        var unanswered=0;
        for(var secI=0;secI<C.sections.length;secI++){
          var ansArr=self._sectionAnswers[secI];
          if(ansArr){
            for(var qi=0;qi<ansArr.length;qi++){
              var a=ansArr[qi];
              if(a===undefined||a===null||a===-1||a===''||(Array.isArray(a)&&a.length===0))unanswered++;
            }
          }
        }
        // 检测是否有 section 使用了 fallback 题库
        var hasFallback=false;
        for(var si=0;si<C.sections.length;si++){
          if(self._fallbackSections[si]){hasFallback=true;break;}
        }
        if(hasFallback&&!(await UiKit.confirm('提示','部分题目未加载成功，提交后这些题将被计为错误。建议刷新后重试。确定继续提交？',{okText:'继续提交',cancelText:'取消',danger:true})))return;
        if(unanswered>0&&!(await UiKit.confirm('提示','还有 '+unanswered+' 道题未作答，确定提交吗？',{okText:'仍然提交',cancelText:'继续作答',danger:true})))return;
        var btn=self._el.finishInfo?self._el.finishInfo.parentNode.querySelector('.mse-btn'):null;
        if(btn){btn.disabled=true;btn.textContent='提交中...'}
        var timeUsed=Math.floor((Date.now()-self._startTime)/1000);
        var body={
          sectionAnswers:{},
          sectionIndices:{},
          mathCorrect:self._mathCorrect||[],
          timeUsed:timeUsed
        };
        for(var secI=0;secI<C.sections.length;secI++){
          var secCfg=C.sections[secI];
          if(secCfg.type==='math'){
            body.sectionIndices[secI]=null;
          }else{
            var indices=self._sectionIndices[secI];
            var order=self._shuffledOrder[secI];
            var actualCount=(order&&order.length)||secCfg.count;
            var mapped=[];
            for(var qi=0;qi<actualCount;qi++){
              var cachePos=(order&&order[qi]!==undefined)?order[qi]:qi;
              mapped[qi]=indices?indices[cachePos]:-1;
            }
            body.sectionIndices[secI]=mapped;
          }
          body.sectionAnswers[secI]=self._sectionAnswers[secI]||[];
        }
        var overlay=document.createElement('div');
        overlay.className='mse-submit-overlay';
        overlay.innerHTML='<div class="mse-submit-loading"><div class="spinner"></div><div>提交中...</div></div>';
        document.body.appendChild(overlay);
        var controller=new AbortController();
        var timeout=setTimeout(function(){controller.abort()},30000);
        fetch(C.api.submit,{
          method:'POST',
          headers:self._headers(),
          body:JSON.stringify(body),
          signal:controller.signal
        }).then(function(r){return r.json()}).then(function(d){
          clearTimeout(timeout);
          if(overlay.parentNode)overlay.remove();
          if(self._isAuthError(d))return;
          if(d.success&&d.result){
            self._saveNow();
            self._showResult(d.result,timeUsed);
            fetch(C.api.saveResult,{
              method:'POST',
              headers:self._headers(),
              body:JSON.stringify(d.result)
            }).then(function(r){return r.json()}).then(function(d2){
              if(d2&&self._isAuthError(d2))return;
            }).catch(function(e){console.warn('[SaveResult]',e&&e.message?e.message:e);});
          }else{
            showToast('提交失败：'+(d.msg||'请重试'), 'error');
            if(btn){btn.disabled=false;btn.textContent='提交结果'}
          }
        }).catch(function(e){
          clearTimeout(timeout);
          if(overlay.parentNode)overlay.remove();
          if(e.name==='AbortError'){showToast('提交超时，网络响应较慢，请检查网络后重试','error');}
          else{showToast('网络异常，请更换优质网络后再试（广东、福建沿海地区可换网络/打开方式或换个时段）','error');}
          if(btn){btn.disabled=false;btn.textContent='提交结果'}
        });
      },

      _showResult: function(r,timeUsed){
        self._resultData=r;
        self._saveWrongFromResult(r);
        self._clearElapsed();
        self._showPhase('result');
        var gc=self._el.gradeCircle;
        // 医院机检标准：1类/2类/3类 → 映射到对应视觉等级（1类=绿/合格，2类=橙/需复查，3类=红/需访谈）
        var clsMap={ '1类':'A', '2类':'C', '3类':'D', 'N':'D' };
        var gNorm=clsMap[r.grade]||r.grade||'D';
        gc.className='mse-grade-circle mse-grade-'+gNorm;
        var letter=self._el.gradeLetter;
        if(letter)letter.textContent=r.grade||'D';
        var desc=self._el.gradeDesc;
        if(desc)desc.textContent=C.gradeLabels[r.grade]||r.grade;
        var scoreEl=self._el.score;
        if(scoreEl&&r.score!==undefined){
          if(r.grade==='N'){ scoreEl.textContent='—'; }
          else {
            var target=r.score,cur=0,step=Math.max(1,Math.ceil(target/30));
            scoreEl.textContent='0分';
            var si=setInterval(function(){cur=Math.min(cur+step,target);scoreEl.textContent=cur+'分';if(cur>=target)clearInterval(si)},25);
          }
        }
        // === Emotional feedback ===
        var emoji,feeling,tips;
        var grade=r.grade||'D';
        if(C.testId==='ww-test'&&(grade==='1类'||grade==='2类'||grade==='3类')){
          if(grade==='1类'){emoji='🎉';feeling='综合表现优秀！数学、言语、职业常识等客观模块均掌握较好，整体水平扎实，具备较好的役前训练基础。保持真实作答的节奏，正式机考稳定发挥即可。';tips=[
            '综合正确率达到85%以上，表现优秀',
            '继续保持真实作答的节奏，正式机考稳定发挥',
            '可针对薄弱题型适当加练，精益求精'
          ]}
          else if(grade==='2类'){emoji='👍';feeling='整体基本达标，但部分模块还有提升空间。建议针对正确率较低的模块重点加练，逐项巩固后综合表现会更稳定。';tips=[
            '综合正确率在60%~85%之间，整体基本达标',
            '找出正确率偏低的模块，进行针对性练习',
            '限时训练提升答题速度与准确率'
          ]}
          else{emoji='💪';feeling='本次综合正确率未达60%，客观题基础仍需夯实。不要气馁——每次测验都是发现问题的机会，从薄弱模块开始有计划地练习，进步会很快。';tips=[
            '综合正确率低于60%，建议从基础题型开始巩固',
            '重点练习数学运算、言语理解等客观模块',
            '每天安排固定时间做题，保持答题感觉'
          ]}
        }
        else if(grade==='1类'||grade==='2类'||grade==='3类'){
          if(grade==='1类'){emoji='🎉';feeling='机检合格！数学、言语、心理各项指标均达到要求，符合入伍初审机检标准。继续保持真实作答的节奏，正式机检稳定发挥即可通过。';tips=[
            '机检结果1类即合格，可直接进入后续环节',
            '真实作答、节奏稳定是保持合格的关键',
            '正式机检时保持与模拟时一致的答题习惯即可'
          ]}
          else if(grade==='2类'){emoji='📋';feeling='机检提示存在智力缺陷风险（数学运算未达要求）。按医院流程需加做纸笔智力测验复核，多数人复核后仍可通过，不必过度担心，但建议针对数学运算加强训练。';tips=[
            '数学部分正确率需达到90%以上',
            '限时速算题要多练，提升运算速度和准确率',
            '正式机检若为2类会安排纸笔智力测验复核，认真作答即可'
          ]}
          else{emoji='⚠️';feeling='机检提示存在心理缺陷风险或言语错误较多，按医院流程需进入人工心理访谈环节。请客观看待结果，重点改善答题方式和心理状态，访谈通过仍有入伍机会。';tips=[
            '心理筛查中请如实作答，避免刻意美化或乱选',
            '避免大量连续选择同一答案，保证作答一致性',
            '言语部分需提高正确率，重点练习找不同、近反义词等题型'
          ]}
        }
        else if(grade==='A'){emoji='🎉';feeling='非常出色！你的综合表现令人印象深刻，展现了扎实的基础和良好的心理素质。继续保持这份自信和专注，你在接下来的挑战中一定会更加出色！';tips=[
          '你的成绩说明你准备充分，继续保持这个节奏',
          '可以挑战更难的内容来进一步提升自己',
          '把你的学习方法分享给需要的朋友吧'
        ]}
        else if(grade==='B'){emoji='👍';feeling='表现不错！大部分题目都掌握得很好，展现出了扎实的能力基础。只要针对薄弱环节稍加练习，下次一定能达到优秀水平。加油！';tips=[
          '回顾错题集，找出薄弱知识点进行针对性练习',
          '尝试限时训练，提高答题速度和准确率',
          '保持每天固定的学习时间，稳步提升'
        ]}
        else if(grade==='C'){emoji='💪';feeling='你已经通过了基本要求，说明具备了一定的基础。但还有提升空间，不要气馁——每次测试都是发现问题的机会。找到短板，制定计划，你一定能做得更好！';tips=[
          '仔细分析错题，理解每道题的正确解法',
          '重点关注正确率低于60%的模块'+(C.mathConfig.enabled?'，特别是数学计算':'')+'',
          '制定一个2周提升计划，针对性复习薄弱科目'
        ]}
        else if(grade==='N'){emoji='🧩';feeling='本次仅完成自评/筛查类模块（人格心理、军营适应），暂不计算综合正确率。建议至少完成一个客观计分模块（数学/言语/职业常识）后再查看综合等级。';tips=[
          '自评/筛查模块（人格心理、军营适应）结果仅供自我参考，不计入正确率',
          '建议完成数学、言语等客观模块后再查看综合评分',
          '保持平常心，多练习客观题提升正确率'
        ]}
        else{emoji='🌱';feeling='每一次测试都是一次成长的机会。虽然这次成绩不太理想，但这恰恰帮你清楚地看到了需要加强的地方。不要灰心，从基础开始，一步一步来，进步一定看得见！';tips=[
          '从最基础的题型开始重新巩固知识点',
          '每天安排固定时间做题，培养答题感觉',
          '寻求帮助，让老师或同学为你答疑解惑',
          '调整好心态，相信自己一定能进步'
        ]}
        var emotionEl=self._el.emotion;
        if(emotionEl){
          emotionEl.className='mse-emotion-box grade-'+gNorm;
          emotionEl.innerHTML='<span class="emoji">'+emoji+'</span><div class="msg">'+_html(feeling)+'</div>';
        }
        // === Improvement suggestions ===
        var sugEl=self._el.suggestions;
        if(sugEl){
          var sugHtml='<div class="s-title">📌 提升建议</div>';
          for(var si=0;si<tips.length;si++){
            sugHtml+='<div class="s-item"><span class="s-icon">✦</span>'+_html(tips[si])+'</div>';
          }
          if(self._timeoutCount>10){
            sugHtml+='<div class="s-item"><span class="s-icon">⏰</span>超时次数较多（'+self._timeoutCount+'次），建议加强速度训练，提高答题效率</div>';
          }
          sugEl.innerHTML=sugHtml;
        }
        // === Section analysis ===
        var analysisEl=self._el.analysis;
        var analysisHtml='';
        if(r.sections){
          for(var i=0;i<r.sections.length&&i<C.sections.length;i++){
            var s=r.sections[i];
            var sec=C.sections[i];
            var pct=Math.max(0, Math.min(100, s.answered>0?Math.round(s.correct/s.answered*100):0));
            var color=pct>=75?'var(--success)':pct>=60?'var(--warning)':'var(--danger)';
            var comment='';
            if(pct>=90){comment='<span class="good">优秀</span>——掌握非常扎实，继续保持'}
            else if(pct>=75){comment='<span class="good">良好</span>——基础较好，有提升空间'}
            else if(pct>=60){comment='<span class="highlight">合格</span>——建议加强练习，查漏补缺'}
            else if(pct>0){comment='<span class="highlight">待提高</span>——需要重点复习，多花时间巩固'}
            else{comment='<span style="color:var(--text-lighter)">未作答</span>——本模块没有答题记录'}
            var barColor=pct>=75?'linear-gradient(90deg,var(--success),var(--success-dark))':pct>=60?'linear-gradient(90deg,var(--warning),var(--warning-dark))':'linear-gradient(90deg,var(--danger),var(--danger))';
            var isPsych = sec.id === 'psych' || sec.type === 'judge' || sec.noScore === true;
            // 初检机考（医院机检标准）：数学<90%→2类，言语<75%→3类
            var isCj = C.testId === 'cj-test';
            if (isPsych) {
              var psychDone=0;
              if(r.details&&r.details[i])r.details[i].forEach(function(dd){if(dd&&dd.userAns>=0)psychDone++;});
              var psychComment = sec.type === 'judge'
                ? '<span style="color:var(--text-light)">心理筛查无标准对错，作答完成即可；如出现心理问题信号（正向作答占比偏低或风险维度偏高）将判为 3类，需人工访谈</span>'
                : '<span style="color:var(--text-light)">自评题无标准对错，作答完成即可，结果仅供参考</span>';
              if(C.testId==='ww-test'){
                psychComment+='<div style="margin-top:8px;padding:8px 10px;background:rgba(var(--accent-rgb),.06);border-radius:8px;font-size:12px;line-height:1.7;color:var(--text)">💡 心理与价值观筛查无标准对错，结果仅供参考。建议前往其他模块（数学、言语、职业常识）再次练习，多模块综合评估更有参考价值。</div>';
              }
              analysisHtml+='<div class="mse-analysis-card">\
  <div class="title">'+_html(sec.icon||'')+' '+_html(sec.name)+'</div>\
  <div class="mse-analysis-bar"><div class="fill" style="width:'+(s.total>0?Math.min(100,Math.round(psychDone/s.total*100)):0)+'%;background:linear-gradient(90deg,var(--accent),var(--accent-dark))"></div></div>\
  <div class="stats"><span>已作答 '+psychDone+'/'+s.total+' 题</span><span class="num" style="color:var(--accent)">'+(s.total>0?Math.min(100,Math.round(psychDone/s.total*100)):0)+'%</span></div>\
  <div class="comment">'+psychComment+'</div>\
</div>';
            } else {
              var aceBadge=pct===100&&s.answered>0?' <span style="font-size:13px">🏆</span>':'';
              var descBadge=sec.desc?'<span style="font-size:11px;color:var(--text-lighter);font-weight:400;margin-left:6px">'+_html(sec.desc.substring(0,36))+'</span>':'';
              var cjNote='';
              if(isCj&&sec.type==='math')cjNote=pct>=90?' <span style="font-size:11px;color:var(--success)">✓ 达标(≥90%)</span>':' <span style="font-size:11px;color:var(--danger)">✗ 未达标(<90%)→判2类</span>';
              if(isCj&&sec.type!=='math'&&sec.type!=='judge')cjNote=pct>=75?' <span style="font-size:11px;color:var(--success)">✓ 达标(≥75%)</span>':' <span style="font-size:11px;color:var(--danger)">✗ 未达标(<75%)→判3类</span>';
              var wwCareerNote='';
              if(C.testId==='ww-test'&&sec.id==='career'){
                wwCareerNote='<div style="margin-top:8px;padding:8px 10px;background:rgba(var(--accent-rgb),.06);border-radius:8px;font-size:12px;line-height:1.7;color:var(--text)">🎯 本模块题目为抽样参考。想针对性强化练习，请前往 <a href="/test4.html" style="color:var(--accent);font-weight:700">基本职业适应能力（单项练习）</a> 进行专项训练。</div>';
              }
              analysisHtml+='<div class="mse-analysis-card">\
  <div class="title">'+_html(sec.icon||'')+' '+_html(sec.name)+aceBadge+descBadge+'</div>\
  <div class="mse-analysis-bar"><div class="fill" style="width:'+pct+'%;background:'+barColor+'"></div></div>\
  <div class="stats"><span>正确 '+s.correct+'/'+s.answered+' 题</span><span class="num" style="color:'+color+'">'+pct+'%</span></div>\
  <div class="comment">'+comment+cjNote+'</div>\
  '+(sec.resultNote?'<div class="mse-result-note">'+_html(sec.resultNote.substring(0,300))+'</div>':'')+'\
  '+wwCareerNote+'\
</div>';
            }
          }
        }
        if(analysisEl)analysisEl.innerHTML=analysisHtml;
        if(r.psychScreening&&analysisEl){
          var ps=r.psychScreening;
          var psFlag,psCls,psIcon;
          if(ps.same>=85){ psFlag='答题方式需注意：大量连续选择同一答案，可能影响筛查有效性'; psCls='mse-dim-warn'; psIcon='⚠'; }
          else if(ps.healthy<=40){ psFlag='存在较多心理困扰信号，请结合自身情况客观看待，必要时可寻求专业帮助'; psCls='mse-dim-alert'; psIcon='⚠'; }
          else if(ps.healthy<=60){ psFlag='心理状态整体平稳，个别方面可留意调整'; psCls='mse-dim-warn'; psIcon='▸'; }
          else { psFlag='心理健康状况总体良好，继续保持积极心态'; psCls='mse-dim-pass'; psIcon='✓'; }
          var psHealthyCls=ps.healthy>=75?'mse-dim-ok':ps.healthy>=60?'mse-dim-warn':'mse-dim-high';
          var psHealthyLbl=ps.healthy>=75?'✓ 良好':ps.healthy>=60?'▸ 一般':'⚠ 偏低';
          var psBarClr=ps.healthy>=75?'var(--success)':ps.healthy>=60?'var(--warning)':'var(--danger)';
          var psHtml='<div class="mse-dim-card">\
<div class="mse-dim-title">🧠 人格心理筛查</div>\
<div class="mse-dim-row"><span class="mse-dim-name">正向作答占比</span><span class="'+psHealthyCls+'">'+psHealthyLbl+'（'+ps.healthy+'%）</span></div>\
<div class="mse-analysis-bar"><div class="fill" style="width:'+Math.min(100,ps.healthy)+'%;background:'+psBarClr+'"></div></div>\
<div class="mse-dim-row"><span class="mse-dim-name">同一答案占比</span><span class="'+(ps.same>=85?'mse-dim-high':'mse-dim-ok')+'">'+(ps.same>=85?'⚠ 偏高（'+ps.same+'%）':'✓ '+ps.same+'%')+'</span></div>\
<div class="mse-dim-foot '+psCls+'">'+psIcon+' '+psFlag+'</div>\
<div style="font-size:12px;color:var(--text-lighter);padding:6px 12px 0">注：本模块为模拟筛查参考，非官方心理测评结论。</div>\
</div>';
          analysisEl.insertAdjacentHTML('afterend',psHtml);
        }
        if((r.grade==='A'||r.grade==='1类'||r.score===100)&&analysisEl&&!self._confettiAdded){
          self._confettiAdded=true;
          var cf=document.createElement('div');cf.className='mse-confetti';
          for(var ci=0;ci<30;ci++){
            var dt=document.createElement('div');dt.className='mse-confetti-dot';
            dt.style.left=Math.random()*100+'%';dt.style.animationDelay=Math.random()*1.5+'s';
            dt.style.backgroundColor=['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#01a3a4','#f368e0'][Math.floor(Math.random()*8)];
            cf.appendChild(dt);
          }
          analysisEl.parentNode.insertBefore(cf,analysisEl);
        }
        // === Psych dimension results ===
        if(r.psychDims){
          var dimHtml='<div class="mse-dim-card">\
  <div class="mse-dim-title">🧠 心理筛查 — 6大风险维度</div>';
          var dimKeys=Object.keys(r.psychDims);
          var anyClassified=false, anyHigh=false;
          for(var dk=0;dk<dimKeys.length;dk++){
            var dimName=dimKeys[dk];
            var dim=r.psychDims[dimName];
            if(dim.count>0)anyClassified=true;
            var ds=dim.score||0;
            if(ds>=70){anyHigh=true;var barClr='var(--danger)';var statCls='mse-dim-high'}
            else if(ds>=50){barClr='var(--warning)';statCls='mse-dim-warn'}
            else{barClr='var(--success)';statCls='mse-dim-ok'}
            var lbl=dim.count>0?(ds>=70?'⚠ 偏高':ds>=50?'▸ 关注':'✓ 正常'):'— 待补充';
            dimHtml+='<div class="mse-dim-row"><span class="mse-dim-name">'+_html(dimName)+'</span><span class="'+statCls+'">'+lbl+'</span></div>\
  <div class="mse-analysis-bar"><div class="fill" style="width:'+ds+'%;background:'+barClr+'"></div></div>';
          }
          var footCls='mse-dim-pass', footTxt='✓ 全部维度正常，通过心理筛查';
          if(!anyClassified){footCls='mse-dim-wait';footTxt='📝 本维度暂无可评分数据，相关结果将暂缓展示，感谢理解。'}
          else if(anyHigh){footCls='mse-dim-alert';footTxt='⚠ 存在高风险维度（≥70分），建议安排心理医生结构式访谈'}
          dimHtml+='<div class="mse-dim-foot '+footCls+'">'+footTxt+'</div></div>';
          if(analysisEl)analysisEl.insertAdjacentHTML('afterend',dimHtml);
        }
        // === 价值观画像（6维） ===
        if(r.valueProfile&&r.valueProfile.scores){
          var vp=r.valueProfile;
          var vpHtml='<div class="mse-dim-card">\
  <div class="mse-dim-title">🧭 价值观画像 — 6大价值维度</div>';
          var vpNotes={
            1:'进取成就：目标导向、自我提升、行动力强',
            2:'坚韧自律：抗压坚持、自律克制、意志坚定',
            3:'团结奉献：乐于助人、重视合作、集体为先',
            4:'纪律服从：规则意识强、尊重秩序、忠诚担当',
            5:'诚信正直：诚实守信、坚守底线、敢于担责',
            6:'开放创新：热爱学习、包容多元、思维灵活'
          };
          for(var vi=0;vi<vp.scores.length;vi++){
            var vd=vp.scores[vi];
            if(!vd)continue;
            var vscore=vd.score||0;
            var vCls=vscore>=75?'mse-dim-ok':vscore>=50?'mse-dim-warn':'mse-dim-high';
            var vLbl=vscore>=75?'较强':vscore>=50?'中等':'偏弱';
            var vBar=vscore>=75?'var(--success)':vscore>=50?'var(--warning)':'var(--danger)';
            vpHtml+='<div class="mse-dim-row"><span class="mse-dim-name">'+_html(vd.name)+'</span><span class="'+vCls+'">'+vLbl+'（'+vscore+'%）</span></div>\
  <div class="mse-analysis-bar"><div class="fill" style="width:'+Math.min(100,vscore)+'%;background:'+vBar+'"></div></div>';
          }
          vpHtml+='<div style="font-size:12px;color:var(--text-lighter);padding:8px 0 2px;line-height:1.7">'+Object.values(vpNotes).map(function(n){return '· '+n}).join('<br>')+'</div>';
          vpHtml+='<div class="mse-dim-foot mse-dim-pass">💡 本部分为自评式价值观测验，没有标准答案，结果反映你的价值取向倾向，仅供参考。</div></div>';
          var vpEl=self._el.analysis;
          if(vpEl){ if(r.psychDims){ vpEl.insertAdjacentHTML('afterend',vpHtml); } else { vpEl.insertAdjacentHTML('beforeend',vpHtml); } }
        }
        var sum=self._el.summary;
        if(sum)sum.innerHTML='<div class="mse-section-row"><span class="label">正确率</span><span class="value">'+r.correct+'/'+r.answered+'（'+r.score+'%）</span></div><div class="mse-section-row"><span class="label">超时次数</span><span class="value">'+self._timeoutCount+'</span></div><div class="mse-section-row"><span class="label">用时</span><span class="value">'+_totalsec(timeUsed||0)+'</span></div>';
        localStorage.removeItem(self._storageKey());
      },

      showWrong: function(){
        var r=self._resultData;
        if(!r||!r.details){
          showToast('错题详情不可用','info');
          return;
        }
        var labels=['A','B','C','D','E','F'];
        var html='';
        var mathSecIdx=-1;
        for(var mi=0;mi<C.sections.length;mi++){if(C.sections[mi].type==='math'){mathSecIdx=mi;break;}}
        for(var si=0;si<C.sections.length;si++){
          var actualCount=(self._shuffledOrder[si]&&self._shuffledOrder[si].length)||C.sections[si].count;
          var secWrong=0;
          var secHtml='';
          var isPsych = C.sections[si].type==='judge'||C.sections[si].id==='psych';
          if(isPsych){
            var psychCache=self._questionsCache[si];
            var psychDiff=[];
            for(var pp=0;pp<actualCount;pp++){
              var pCachePos=(self._shuffledOrder[si]&&self._shuffledOrder[si][pp]!==undefined)?self._shuffledOrder[si][pp]:pp;
              var pd=r.details[si]?r.details[si][pp]:null;
              if(!pd)continue;
              // 仅展示用户回答与建议答案不一致的题目，一致的作答不再列出
              if(pd.userAns===pd.correctAns)continue;
              psychDiff.push({pp:pp,pd:pd,pCachePos:pCachePos});
            }
            if(psychDiff.length>0){
              secHtml='<div style="font-size:13px;color:var(--text-light);padding:8px 12px;border-bottom:1px solid var(--border);margin-bottom:12px">心理筛查无标准对错，以下仅展示你的回答与建议答案不一致的题目（回答与建议一致的不再列出）：</div>';
            }else{
              secHtml='<div style="font-size:13px;color:var(--success);padding:8px 12px;border-bottom:1px solid var(--border);margin-bottom:12px">你的心理筛查作答均与建议答案一致，无需回顾。</div>';
            }
            for(var pdi=0;pdi<psychDiff.length;pdi++){
              var pdiff=psychDiff[pdi];
              var pp=pdiff.pp,pd=pdiff.pd,pCachePos=pdiff.pCachePos;
              secWrong++;
              var pqText='';
              if(psychCache&&psychCache[pCachePos]){
                var pcq=psychCache[pCachePos];
                pqText=pcq.q||'';
              }
              if(!pqText)pqText='（题目文本不可用）';
              var pAns='未作答',pCorrect='未设置';
              if(pd.userAns===0)pAns='是';
              else if(pd.userAns===1)pAns='否';
              if(pd.correctAns===0)pCorrect='是';
              else if(pd.correctAns===1)pCorrect='否';
              secHtml+='<div class="mse-wrong-item"><div class="q"><b>'+(pp+1)+'.</b> '+_html(pqText)+'</div><div class="detail"><span class="user-ans">你的回答：'+pAns+'</span> | <span class="correct-ans">建议答案：'+pCorrect+'</span></div></div>';
            }
            if(r.psychDims){
              var dimExplains = {
                '分离倾向': {high:'偏好独处，社交回避倾向明显，在集体环境中可能感到不适',normal:'社交参与度正常，能平衡独处与集体活动',low:'社交活跃，乐于融入集体'},
                '神经倾向': {high:'情绪敏感度较高，容易紧张焦虑，心理压力反应明显',normal:'情绪状态稳定，能较好应对日常压力',low:'心理韧性强，情绪调节能力好'},
                '敏感倾向': {high:'对人事物敏感多疑，容易过度解读他人言行',normal:'感知敏锐度适中，判断客观理性',low:'心态开放包容，不易受外界影响'},
                '偏离倾向': {high:'思维方式或行为模式偏离常规，对规范的认同度较低',normal:'行为模式在正常范围内，能遵守基本规范',low:'高度认同主流规范，行为方式稳健'},
                '冲动倾向': {high:'行动前缺乏充分思考，容易凭一时冲动做决定',normal:'具备较好的自我控制能力，能权衡后再行动',low:'行事谨慎周密，自控力强'},
                '悖逆倾向': {high:'对权威和规则有较强的质疑和抵触倾向',normal:'在遵守规则的前提下保持独立思考',low:'高度尊重规则和权威，服从性强'}
              };
              secHtml+='<div style="padding:8px 0"><div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:10px">\u{1F9E0} 各维度详细解读</div>';
              var dimKeys=Object.keys(r.psychDims);
              for(var dk=0;dk<dimKeys.length;dk++){
                var dName=dimKeys[dk];
                var dim=r.psychDims[dName];
                if(!dim||dim.count===0)continue;
                var ds=dim.score||0;
                var exp=dimExplains[dName]||{};
                var levelTxt=ds>=70?'\u26A0\uFE0F 偏高':ds>=50?'\u25B8 关注':'\u2714\uFE0F 正常';
                var levelClr=ds>=70?'var(--danger)':ds>=50?'var(--warning)':'var(--success)';
                var interp=ds>=70?exp.high||'':ds>=50?exp.normal||'':exp.low||'';
                secHtml+='<div style="background:var(--hover-bg);border-radius:10px;padding:10px 14px;margin-bottom:8px;border-left:3px solid '+levelClr+'">\
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">\
    <span style="font-size:13px;font-weight:600;color:var(--text)">'+_html(dName)+'</span>\
    <span style="font-size:12px;font-weight:600;color:'+levelClr+'">'+levelTxt+'（'+ds+'分）</span>\
  </div>\
  <div style="height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;margin-bottom:6px">\
    <div style="height:100%;width:'+ds+'%;background:'+levelClr+';border-radius:3px;transition:width .3s"></div>\
  </div>\
  <div style="font-size:12px;color:var(--text-light);line-height:1.5">'+_html(interp)+'</div>\
</div>';
              }
              secHtml+='</div>';
              var anyHigh=dimKeys.some(function(k){return r.psychDims[k]&&r.psychDims[k].score>=70});
              secHtml+='<div style="padding:10px 14px;border-radius:10px;font-size:13px;'+(anyHigh?'background:rgba(var(--danger-rgb),.08);color:var(--danger);border:1px solid rgba(var(--danger-rgb),.2)':'background:rgba(var(--success-rgb),.08);color:var(--success);border:1px solid rgba(var(--success-rgb),.2)')+'">'+(anyHigh?'\u26A0\uFE0F 存在高风险维度（≥70分），建议进一步关注和了解':'✅ 全部维度正常，通过心理筛查')+'</div>';
            }
          }else{
          for(var pi=0;pi<actualCount;pi++){
            var cachePos=(self._shuffledOrder[si]&&self._shuffledOrder[si][pi]!==undefined)?self._shuffledOrder[si][pi]:pi;
            var d=r.details[si]?r.details[si][pi]:null;
            if(!d||d.correct!==false)continue;
            secWrong++;
            var qText='';
            var userText='';
            var correctText='';
            var explain='';
            var subtype='';
            var cache=self._questionsCache[si];
            if(si===mathSecIdx&&C.mathConfig.enabled&&self._mathQuestions[pi]){
              var mq=self._mathQuestions[pi];
              if(mq){var pfx=String(mq.result).slice(0,-1)||'';qText=mq.a+' '+(mq.op||'+')+' '+mq.b+' = '+pfx+'?';userText=d.userAns>=0&&d.userAns!==-1?'你填了 '+d.userAns:'未答';correctText='参考答案：'+mq.result;}
            }else if(cache&&cache[cachePos]){
              var cq=cache[cachePos];
              qText=cq.q||'';
              subtype=cq.subtype||'';
              var opts=cq.opts||[];
              if(opts.length>0){
                var uaIdx=d.userAns;
                var caIdx=d.correctAns;
                if(d.type==='multi'||Array.isArray(uaIdx)||Array.isArray(caIdx)){
                  if(Array.isArray(uaIdx)&&uaIdx.length>0){
                    var uaParts=uaIdx.map(function(idx){return (idx<labels.length?labels[idx]:'')+'. '+MathRender.render(idx<opts.length?opts[idx]:'')});
                    userText='你的答案：'+uaParts.join('、');
                  }else{
                    userText='你的答案：未答';
                  }
                  if(Array.isArray(caIdx)&&caIdx.length>0){
                    var caParts=caIdx.map(function(idx){return (idx<labels.length?labels[idx]:'')+'. '+MathRender.render(idx<opts.length?opts[idx]:'')});
                    correctText='参考答案：'+caParts.join('、');
                  }
                }else{
                  if(uaIdx>=0&&uaIdx<opts.length){
                    var uaLabel=(uaIdx<labels.length?labels[uaIdx]+'. ':'')+MathRender.render(opts[uaIdx]);
                    userText='你的答案：'+uaLabel;
                  }else{
                    userText='你的答案：未答';
                  }
                  if(caIdx>=0&&caIdx<opts.length){
                    var caLabel=(caIdx<labels.length?labels[caIdx]+'. ':'')+MathRender.render(opts[caIdx]);
                    correctText='参考答案：'+caLabel;
                  }
                }
              }
              explain=cq.explain||'';
            }
            var extra='';
            if(subtype)extra='<span style="display:inline-block;background:rgba(var(--accent-rgb),.1);color:var(--accent-dark);font-size:11px;font-weight:600;padding:1px 8px;border-radius:8px;margin-left:8px">'+_html(subtype)+'</span>';
            var explainHtml='';
            if(explain)explainHtml='<div class="wrong-explain">💡 '+MathRender.render(explain)+'</div>';
            secHtml+='<div class="mse-wrong-item"><div class="q"><b>'+(pi+1)+'.</b> '+MathRender.render(qText)+extra+'</div><div class="detail"><span class="user-ans">'+userText+'</span> | <span class="correct-ans">'+correctText+'</span></div>'+explainHtml+'</div>';
          }}
          if(secWrong>0 || isPsych){
            html+='<div class="mse-wrong-section">'+_html(C.sections[si].icon||'')+' '+_html(C.sections[si].name)+'</div>'+secHtml;
          }
        }
        if(!html)html='<p style="text-align:center;color:var(--success);font-size:16px;padding:20px">🎉 全部正确，没有错题！</p>';
        var title=self._el.modalTitle;
        if(title)title.textContent='📝 错题回顾';
        var body=self._el.modalBody;
        if(body)body.innerHTML=html;
        var modal=self._el.modal;
        if(modal)modal.className='';
      },

      closeModal: function(){
        var modal=self._el.modal;
        if(modal)modal.className='mse-hidden';
      },

      _saveWrongFromResult: function(r){
        if(!r||!r.details)return;
        var mathSecIdx=-1;
        for(var mi=0;mi<C.sections.length;mi++){if(C.sections[mi].type==='math'){mathSecIdx=mi;break;}}
        var wrongQs=[];
        for(var si=0;si<C.sections.length;si++){
          if(C.sections[si].type==='judge'||C.sections[si].id==='psych'||C.sections[si].type==='math')continue;
          var actualCount=(self._shuffledOrder[si]&&self._shuffledOrder[si].length)||C.sections[si].count;
          for(var pi=0;pi<actualCount;pi++){
            var cachePos=(self._shuffledOrder[si]&&self._shuffledOrder[si][pi]!==undefined)?self._shuffledOrder[si][pi]:pi;
            var d=r.details[si]?r.details[si][pi]:null;
            if(!d||d.correct)continue;
            var qText='',opts=[];
            if(si===mathSecIdx&&C.mathConfig.enabled&&self._mathQuestions[pi]){
              var mq=self._mathQuestions[pi];
              if(mq){var pfx=String(mq.result).slice(0,-1)||'';qText=mq.a+' '+(mq.op||'+')+' '+mq.b+' = '+pfx+'?';opts=[];}
            }else{
              var cache=self._questionsCache[si];
              if(cache&&cache[cachePos]){
                var cq=cache[cachePos];
                qText=cq.q||'';
                opts=cq.opts||[];
              }
            }
            if(!qText)continue;
            wrongQs.push({question_text:qText,opts_json:JSON.stringify(opts),user_ans:d.userAns,correct_ans:d.correctAns});
          }
        }
        if(wrongQs.length===0)return;
        try{
          fetch('/api/wrong-questions/save-from-review',{
            method:'POST',
            headers:self._headers(),
            body:JSON.stringify({testId:C.testId,questions:wrongQs})
          }).catch(function(){});
        }catch(e){}
      },

      _updateHeader: function(){
        var sec=C.sections[self._currentSection];
        if(!sec)return;
        var h=self._el.header;
        if(h)h.textContent=(sec.icon||'')+' '+(sec.name||'');
      },

      _startTimer: function(secs){
        self._clearTimer();
        var bar=self._el.timer;
        if(!bar)return;
        bar.style.width='100%';
        bar.className='mse-timer-fill';
        if(!secs||secs<=0){bar.style.width='0%';return}
        var start=Date.now();
        self._timerId=setInterval(function(){
          var elapsed=Date.now()-start;
          var pct=Math.max(0,100-(elapsed/(secs*10)));
          bar.style.width=pct+'%';
          if(pct<=20&&pct>5){bar.className='mse-timer-fill warn'}
          else if(pct<=5){bar.className='mse-timer-fill danger'}
          if(pct<=0){
            self._clearTimer();
            self._timeoutCount++;
            if(!self._isAnswered){
              self._isAnswered=true;
              self._advance();
            }
          }
        },250);
      },

      _clearTimer: function(){
        if(self._timerId){clearInterval(self._timerId);self._timerId=null}
      },

      _clearElapsed: function(){
        if(self._elapsedTimerId){clearInterval(self._elapsedTimerId);self._elapsedTimerId=null}
      },

      _updateElapsed: function(){
        if(!self._startTime)return;
        var s=Math.floor((Date.now()-self._startTime)/1000);
        var el=self._el.elapsed;
        if(el)el.textContent='已用时: '+_totalsec(s);
        var finTime=document.getElementById('mse_finish_time');
        if(finTime)finTime.textContent=_totalsec(s);
      },

      _bindKeyboard: function(){
        if(self._keyHandler)document.removeEventListener('keydown',self._keyHandler);
        self._keyHandler=function(e){
          if(e.ctrlKey||e.altKey||e.metaKey||e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
          var sec=C.sections[self._currentSection];
          if(!sec)return;
          var qIdx=self._currentQ;
          var key=e.key;
          if(key==='ArrowLeft'||key==='ArrowUp'){
            e.preventDefault();
            if(self._currentQ>0){self._currentQ--;self._saveState();self._renderQuestion();}
            return;
          }
          if(key==='ArrowRight'||key==='ArrowDown'){
            e.preventDefault();
            if(!self._isAnswered)return;
            self._advance();
            return;
          }
          if(key==='Enter'||key===' '){
            e.preventDefault();
            if(!self._isAnswered)return;
            self._advance();
            return;
          }
          var type=sec.type;
          if(type==='math')return;
          var labels=['A','B','C','D','E','F','G','H'];
          var idx=-1;
          if(['1','2','3','4','5','6','7','8'].indexOf(key)>=0)idx=parseInt(key)-1;
          else if(['a','b','c','d','e','f','g','h','A','B','C','D','E','F','G','H'].indexOf(key)>=0)idx=labels.indexOf(key.toUpperCase());
          if(idx<0||idx>=8)return;
          e.preventDefault();
          if(type==='multi'){
            var optsDiv=self._el.options;
            var opts=optsDiv.querySelectorAll('.mse-opt');
            if(idx<opts.length)opts[idx].click();
          }else if(type==='judge'){
            if(idx===0)self._selectAnswer(0,self._currentSection,qIdx);
            else if(idx===1)self._selectAnswer(1,self._currentSection,qIdx);
          }else{
            self._selectAnswer(idx,self._currentSection,qIdx);
          }
        };
        document.addEventListener('keydown',self._keyHandler);
      },

      _renderMath: function(qIdx){
        var q=self._mathQuestions[qIdx];
        if(!q){self._el.qtext.textContent='题目生成失败';return}
        var prefix=String(q.result).slice(0,-1)||'';
        var secIdx=self._currentSection;
        var savedVal=self._sectionAnswers[secIdx]?self._sectionAnswers[secIdx][qIdx]:-1;
        var valStr=(savedVal!==undefined&&savedVal>=0&&savedVal<=9)?String(savedVal):'';
        var qtext=self._el.qtext;
        var eqWrap=qtext.querySelector('.mse-math-eq');
        if(!eqWrap){
          qtext.innerHTML='<div class="mse-math-eq"><span class="mse-math-text"></span><input class="mse-math-input" id="mseMathInput" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" value=""></div>';
          var inp=document.getElementById('mseMathInput');
          self._mathAdvancing=false;
          var _record=function(){
            if(self._mathAdvancing)return;
            // 归一化全角数字/空白，只保留 1 位数字
            var v=String(this.value||'').replace(/[０-９]/g,function(ch){return String.fromCharCode(ch.charCodeAt(0)-0xFEE0)}).replace(/\s+/g,'').replace(/[^0-9]/g,'').slice(0,1);
            this.value=v;
            if(v.length===1){
              self._mathAdvancing=true;
              if(!self._sectionAnswers[secIdx])self._sectionAnswers[secIdx]=new Array(C.sections[secIdx].count).fill(-1);
              self._sectionAnswers[secIdx][self._currentQ]=parseInt(v);
              self._clearTimer();
              if(self.studyMode){
                self._isAnswered=true;
                self._renderMathFeedback(self._currentQ);
                self._showNextBtn();
                return;
              }
              if(self.autoAdvance){
                setTimeout(function(){self._advance()},300);
              }else{
                self._mathAdvancing=false;
                self._showNextBtn();
              }
            }
          };
          inp.addEventListener('input',_record);
          // 兼容部分移动端键盘 input 事件不可靠的情况
          inp.addEventListener('keyup',_record);
          inp.addEventListener('compositionend',_record);
          inp.addEventListener('keydown',function(e){
            if(e.key==='Enter'){e.preventDefault();if(this.value.length===0)self.skip()}
          });
        }
        eqWrap=qtext.querySelector('.mse-math-eq');
        if(eqWrap){
          eqWrap.querySelector('.mse-math-text').textContent=q.a+' '+(q.op||'+')+' '+q.b+' = '+prefix;
          var inp=eqWrap.querySelector('.mse-math-input');
          if(inp){inp.value=valStr;setTimeout(function(){try{inp.focus({preventScroll:true})}catch(e){inp.focus()}},60)}
        }
        var optsDiv=self._el.options;
        optsDiv.innerHTML='<div style="text-align:center;color:var(--text-lighter);font-size:13px;padding:8px">填入结果的个位数，按 Enter 或自动跳转</div>';
        var nav=self._el.nav;
        var mPrevBtn=self._currentQ>0?'<button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.back()" style="margin-right:auto">← 上一题</button>':'';
        nav.innerHTML=mPrevBtn+'<button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.skip()">跳过</button>'
          +'<button class="mse-btn gray" onclick="MultiSectionEngine._inst&&MultiSectionEngine._inst.skipSection()" style="margin-left:8px;background:rgba(var(--warning-rgb),.1);border-color:var(--warning);color:var(--warning)">跳过本部分</button>';
        self._mathAdvancing=false;
        self._isAnswered=false;
        if(self.studyMode&&savedVal>=0){
          self._isAnswered=true;
          self._renderMathFeedback(qIdx);
          self._showNextBtn();
        }
      },

      _saveNow: function(){
        if(self._saveTimer){clearTimeout(self._saveTimer);self._saveTimer=null}
        try{
          var st={
            version:5,
            sectionAnswers:self._sectionAnswers,
            sectionIndices:self._sectionIndices,
            fallbackSections:self._fallbackSections,
            currentSection:self._currentSection,
            currentQ:self._currentQ,
            timeoutCount:self._timeoutCount,
            startTime:self._startTime,
            mathQuestions:self._mathQuestions,
            mathCorrect:self._mathCorrect,
            questionsCache:self._questionsCache,
            shuffledOrder:self._shuffledOrder
          };
          localStorage.setItem(self._storageKey(),JSON.stringify(st));
        }catch(e){}
      },

      _saveState: function(){
        if(self._saveTimer)clearTimeout(self._saveTimer);
        self._saveTimer=setTimeout(function(){
          self._saveTimer=null;
          try{
            var st={
            version:5,
            sectionAnswers:self._sectionAnswers,
            sectionIndices:self._sectionIndices,
            fallbackSections:self._fallbackSections,
            currentSection:self._currentSection,
            currentQ:self._currentQ,
            timeoutCount:self._timeoutCount,
            startTime:self._startTime,
            mathQuestions:self._mathQuestions,
            mathCorrect:self._mathCorrect,
            questionsCache:self._questionsCache,
            shuffledOrder:self._shuffledOrder
          };
            localStorage.setItem(self._storageKey(),JSON.stringify(st));
          }catch(e){}
        },1500);
      },

      _restoreState: async function(){
        try{
          var raw=localStorage.getItem(self._storageKey());
          if(!raw)return;
          var state=JSON.parse(raw);
          if(!state||!state.version||state.version<4||state.version>5){
            localStorage.removeItem(self._storageKey());
            return;
          }
          if(typeof Auth==='undefined'||!Auth.isLoggedIn()){
            localStorage.removeItem(self._storageKey());
            return;
          }
          var cu=Auth.getCurrentUser();
          if(cu&&(cu.account_type==='trial'||cu.account_type==='agent')){
            localStorage.removeItem(self._storageKey());
            location.href='/upgrade?redirect=/'+C.testId+'.html';
            return;
          }
          var confirmed=await UiKit.confirm('提示','检测到上次未完成的测验，是否继续？',{okText:'继续',cancelText:'重新开始'});
          if(!confirmed){
            localStorage.removeItem(self._storageKey());
            return;
          }
          self._sectionAnswers=state.sectionAnswers||{};
          self._sectionIndices=state.sectionIndices||{};
          self._fallbackSections=state.fallbackSections||{};
          self._currentSection=state.currentSection;
          self._currentQ=state.currentQ;
          self._timeoutCount=state.timeoutCount||0;
          self._startTime=state.startTime;
          if(state.mathQuestions)self._mathQuestions=state.mathQuestions;
          if(state.mathCorrect)self._mathCorrect=state.mathCorrect;
          if(state.questionsCache)self._questionsCache=state.questionsCache;
          if(state.shuffledOrder)self._shuffledOrder=state.shuffledOrder;
          self._showPhase('section');
          self._elapsedTimerId=setInterval(self._updateElapsed,1000);
          self._loadSection(self._currentSection, self._currentQ);
          self._bindKeyboard();
        }catch(e){
          localStorage.removeItem(self._storageKey());
        }
      },

      destroy: function(){
        self._clearTimer();
        self._clearElapsed();
        if(self._keyHandler)document.removeEventListener('keydown',self._keyHandler);
        if(self._container)self._container.innerHTML='';
        if(window.MultiSectionEngine._inst===self)window.MultiSectionEngine._inst=null;
      }
    };

    return self;
  }
};
})();
