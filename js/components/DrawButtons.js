/* ==================== 抽取页按钮组组件 ==================== */
(function() {
  'use strict';
  var SNP = window.__SNP;
  SNP.components = SNP.components || {};

  SNP.components.DrawButtons = function(h, s) {
    var isPK = s.drawMode.value === 'pk' || s.pkMode.value;

    if (s.getDrawModeValue() === 'multimode') {
      return [
        h('div', { class: 'btn-group' }, [
          h('button', { class: 'btn btn-primary', style: 'flex:1;', onClick: s.drawSingle }, [h('i', { class: 'fas fa-dice' }), ' 单次']),
          h('button', { class: 'btn btn-primary', style: 'flex:1;', onClick: s.toggleContinuous }, [h('i', { class: 'fas fa-'+(s.isContinuous.value ? 'stop' : 'play') }), ' '+(s.isContinuous.value ? '停止' : '快速')]),
          h('button', { class: 'btn btn-primary', style: 'flex:1;', onClick: s.startTension }, [h('i', { class: 'fas fa-heartbeat' }), ' 惊心'])
        ]),
        h('div', { class: 'btn-group' }, [
          h('button', { class: 'btn btn-danger', style: 'flex:1;', onClick: function() { s.pkMode.value = true; s.drawSingle(); s.pkMode.value = false; } }, [h('i', { class: 'fas fa-fist-raised' }), ' PK!'])
        ]),
        h('div', { class: 'btn-group' }, [
          h('button', { class: 'btn btn-success', onClick: s.drawMultiWithAnimation }, [h('i', { class: 'fas fa-bolt' }), ' 连抽'+s.multiDrawCount.value]),
          h('button', { class: 'btn btn-warning', onClick: function() { s.showBatchPanel.value = !s.showBatchPanel.value; } }, [h('i', { class: 'fas fa-users' }), ' 批量']),
          h('button', { class: 'btn btn-outline', onClick: s.goBack }, [h('i', { class: 'fas fa-arrow-left' }), ' 返回']),
          s.usedList.value.length > 0 && h('button', { class: 'btn btn-danger', onClick: s.showResetHistoryModal }, [h('i', { class: 'fas fa-sync-alt' }), ' 重置'])
        ])
      ];
    }

    if (isPK) {
      return [
        h('div', { class: 'btn-group' }, [
          h('button', { class: 'btn btn-primary', style: 'flex:2;', onClick: s.drawSingle }, [h('i', { class: 'fas fa-fist-raised' }), ' ⚔ PK!']),
          h('button', { class: 'btn btn-success', style: 'flex:1;', onClick: s.drawMultiWithAnimation }, [h('i', { class: 'fas fa-bolt' }), ' 连抽'+s.pkCountPerSide.value+'v'+s.pkCountPerSide.value])
        ]),
        h('div', { class: 'btn-group' }, [
          h('button', { class: 'btn btn-outline', onClick: s.goBack }, [h('i', { class: 'fas fa-arrow-left' }), ' 返回设置']),
          s.usedList.value.length > 0 && h('button', { class: 'btn btn-danger', onClick: s.showResetHistoryModal }, [h('i', { class: 'fas fa-sync-alt' }), ' 重置'])
        ])
      ];
    }

    return [
      h('div', { class: 'btn-group' }, [
        h('button', { class: 'btn btn-primary', style: 'flex:1;', onClick: s.drawSingle }, [h('i', { class: 'fas fa-dice' }), ' 单次']),
        h('button', { class: 'btn btn-primary', style: 'flex:1;', onClick: s.toggleContinuous }, [h('i', { class: 'fas fa-'+(s.isContinuous.value ? 'stop' : 'play') }), ' '+(s.isContinuous.value ? '停止' : '快速')]),
        h('button', { class: 'btn btn-primary', style: 'flex:1;', onClick: s.startTension }, [h('i', { class: 'fas fa-heartbeat' }), ' 惊心'])
      ]),
      h('div', { class: 'btn-group' }, [
        h('button', { class: 'btn btn-success', onClick: s.drawMultiWithAnimation }, [h('i', { class: 'fas fa-bolt' }), ' 连抽'+s.multiDrawCount.value]),
        h('button', { class: 'btn btn-warning', onClick: function() { s.showBatchPanel.value = !s.showBatchPanel.value; } }, [h('i', { class: 'fas fa-users' }), ' 批量']),
        h('button', { class: 'btn btn-outline', onClick: s.goBack }, [h('i', { class: 'fas fa-arrow-left' }), ' 返回']),
        s.usedList.value.length > 0 && h('button', { class: 'btn btn-danger', onClick: s.showResetHistoryModal }, [h('i', { class: 'fas fa-sync-alt' }), ' 重置'])
      ])
    ];
  };
})();
