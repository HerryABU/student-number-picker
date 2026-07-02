/* ==================== 主入口 - 智能学号抽取系统 V6.0.0 ==================== */
(function() {
  'use strict';
  
  var CDN_DEPS = [
    { name: 'FontAwesome', url: 'vendor/css/all.min.css', type: 'css' },
    { name: 'Vue', url: 'vendor/js/vue.global.min.js', global: 'Vue', type: 'js' },
    { name: 'XLSX', url: 'vendor/js/xlsx.full.min.js', global: 'XLSX', type: 'js' }
  ];
  
  var LOCAL_MODULES = [
    'js/core.js',
    'js/audio.js',
    'js/app.js',
    'js/components/DisplayArea.js',
    'js/components/AdvancedPanel.js',
    'js/components/HistoryList.js',
    'js/components/Modals.js',
    'js/components/Fullscreen.js',
    'js/components/DrawButtons.js',
    'js/components/StudentPanel.js',
    'js/components/SetupAdvancedPanel.js',
    'js/render.js'
  ];
  
  var loadedCount = 0;
  var totalCount = CDN_DEPS.length + LOCAL_MODULES.length;
  
  function createLoadingElement() {
    var div = document.createElement('div');
    div.id = 'app-loading';
    div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f8fafc;z-index:9999;font-family:system-ui,sans-serif;';
    div.innerHTML = '<div style="width:60px;height:60px;border:4px solid #e2e8f0;border-top-color:#4361ee;border-radius:50%;animation:spin 1s linear infinite;"></div><div style="margin-top:20px;color:#1e293b;font-size:16px;">加载中... 0/'+totalCount+'</div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
    return div;
  }
  
  function updateProgress() {
    var el = document.getElementById('app-loading');
    if (el) { var t = el.querySelector('div:last-child'); if (t) t.textContent = '加载中... '+loadedCount+'/'+totalCount; }
  }
  
  function loadScript(url, checkGlobal) {
    return new Promise(function(resolve, reject) {
      if (checkGlobal && window[checkGlobal]) { loadedCount++; updateProgress(); resolve(); return; }
      var s = document.createElement('script');
      s.src = url;
      s.onload = function() { loadedCount++; updateProgress(); resolve(); };
      s.onerror = function() { reject(new Error('Failed to load: ' + url)); };
      document.head.appendChild(s);
    });
  }
  
  function loadStylesheet(url) {
    return new Promise(function(resolve, reject) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = url;
      l.onload = function() { loadedCount++; updateProgress(); resolve(); };
      l.onerror = function() { reject(new Error('Failed to load CSS: ' + url)); };
      document.head.appendChild(l);
    });
  }
  
  async function init() {
    var loadingEl = createLoadingElement();
    document.body.appendChild(loadingEl);
    
    try {
      // 1. 并行加载CDN依赖（CSS + JS）
      var cdnTasks = CDN_DEPS.map(function(dep) {
        if (dep.type === 'css') return loadStylesheet(dep.url);
        return loadScript(dep.url, dep.global);
      });
      await Promise.all(cdnTasks);
      
      // 2. 并行加载本地模块
      var localTasks = LOCAL_MODULES.map(function(mod) {
        return loadScript(mod, null);
      });
      await Promise.all(localTasks);
      
      loadingEl.remove();
      
      // 3. 启动应用
      if (window.__SNP && window.__SNP.createApp) {
        window.__SNP.createApp();
      } else {
        document.body.innerHTML = '<div style="color:#ef476f;text-align:center;padding:20px;margin-top:40vh;"><div style="font-size:48px;margin-bottom:16px;">😵</div><div style="font-size:18px;font-weight:600;">应用模块加载失败</div><div style="font-size:14px;color:#64748b;">请检查文件完整性后刷新页面</div></div>';
      }
    } catch (e) {
      loadingEl.innerHTML = '<div style="color:#ef476f;text-align:center;padding:20px;"><div style="font-size:48px;margin-bottom:16px;">😵</div><div style="font-size:18px;font-weight:600;margin-bottom:8px;">加载失败</div><div style="font-size:14px;color:#64748b;">请检查网络连接后刷新页面</div><button onclick="location.reload()" style="margin-top:20px;padding:10px 24px;background:#4361ee;color:white;border:none;border-radius:8px;cursor:pointer;">重新加载</button></div>';
    }
  }
  
  init();
})();
