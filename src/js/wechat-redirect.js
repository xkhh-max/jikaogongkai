(function(){
  window._isWechat=/MicroMessenger|Wechat/i.test(navigator.userAgent);
  // 微信入口开关：true = 微信内打开统一引导到说明页(wx-redirect.html)；
  // 待微信解除拦截、可直接访问后，改为 false 即停用，微信用户正常进入主站。
  var REDIRECT_ENABLED=false;
  var bypass=false;
  try{bypass=!!sessionStorage.getItem('_wx_skip')}catch(e){}
  if(REDIRECT_ENABLED && window._isWechat && !bypass && location.pathname.indexOf('wx-redirect')<0){
    location.replace('/wx-redirect.html?to='+encodeURIComponent(location.pathname+location.search));
  }
})();
