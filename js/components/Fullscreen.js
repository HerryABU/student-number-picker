/* ==================== 全屏特效组件 ==================== */
(function() {
  'use strict';
  var SNP = window.__SNP;
  SNP.components = SNP.components || {};

  SNP.components.Fullscreen = function(h, s) {
    if (!s.showFullscreenEffect.value) return null;
    return h('div', { class: 'fullscreen-overlay', onClick: function() { s.showFullscreenEffect.value = false; if (s.fullscreenTimer.value) { clearInterval(s.fullscreenTimer.value); s.fullscreenTimer.value = null; } } }, [
      h('div', { class: 'fullscreen-main' }, [
        h('div', { class: 'fullscreen-number' }, s.fullscreenNumber.value),
        s.fullscreenName.value && h('div', { class: 'fullscreen-name' }, s.fullscreenName.value),
        h('div', { class: 'fullscreen-results' },
          (s.fullscreenResults.value || []).map(function(item, i) {
            return h('div', { class: 'fullscreen-chip', key: i, style: 'animation-delay:'+(i*0.1)+'s;' }, [
              h('div', { class: 'fullscreen-chip-id' }, item.student_id),
              item.name && h('div', { class: 'fullscreen-chip-name' }, item.name)
            ]);
          })
        )
      ]),
      h('div', { class: 'close-fullscreen' }, '点击任意位置关闭')
    ]);
  };

  SNP.components.Celebration = function(h, s) {
    if (!s.showCelebration.value) return null;
    return h('div', [
      h('div', { class: 'celebration-container' }),
      h('div', { class: 'celebration-message' }, s.celebrationMessage.value)
    ]);
  };
})();
