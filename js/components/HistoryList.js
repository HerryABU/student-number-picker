/* ==================== 历史记录组件 ==================== */
(function() {
  'use strict';
  var SNP = window.__SNP;
  SNP.components = SNP.components || {};

  SNP.components.HistoryList = function(h, s) {
    if (!s.usedList.value.length) return null;
    return h('div', { class: 'history-section' }, [
      h('div', { class: 'history-header' }, [
        h('span', '已抽取 ('+s.usedList.value.length+'/'+s.totalCount.value+')'),
        h('button', { style: 'background:none;border:none;color:var(--text-tertiary);cursor:pointer;', onClick: s.showClearHistoryModal }, [
          h('i', { class: 'fas fa-trash' }), ' 清除'
        ])
      ]),
      h('div', { class: 'history-list' },
        s.usedList.value.map(function(item, i) {
          return h('div', { class: ['history-item', { latest: i === s.usedList.value.length - 1 }], key: i },
            (item.gender === 'male' ? '♂' : item.gender === 'female' ? '♀' : '') + item.student_id + (item.name ? ' ' + item.name : '')
          );
        })
      )
    ]);
  };
})();
