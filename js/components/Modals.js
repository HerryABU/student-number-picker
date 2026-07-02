/* ==================== 模态框 & 通知 & Sheet选择组件 ==================== */
(function() {
  'use strict';
  var SNP = window.__SNP;
  SNP.components = SNP.components || {};

  SNP.components.Modals = function(h, s) {
    return [
      s.showModal.value && h('div', { class: 'modal-overlay', onClick: function() { s.showModal.value = false; } }, [
        h('div', { class: 'modal', onClick: function(e) { e.stopPropagation(); } }, [
          h('div', { class: 'modal-header' }, s.modalConfig.value.title),
          h('div', { class: 'modal-body' }, [
            h('p', s.modalConfig.value.message),
            s.modalConfig.value.inputRequired && h('input', { class: 'modal-input', type: 'text', value: s.modalConfig.value.inputValue, placeholder: s.modalConfig.value.inputPlaceholder || '', onInput: function(e) { s.modalConfig.value.inputValue = e.target.value; } })
          ]),
          h('div', { class: 'modal-footer' }, [
            h('button', { class: 'btn btn-outline', onClick: function() { s.showModal.value = false; } }, '取消'),
            h('button', { class: ['btn', s.modalConfig.value.danger ? 'btn-danger' : 'btn-primary'], onClick: function() { if (s.modalConfig.value.onConfirm) s.modalConfig.value.onConfirm(); } }, s.modalConfig.value.confirmText || '确定')
          ])
        ])
      ])
    ];
  };

  SNP.components.Notifications = function(h, s) {
    if (!s.notifications.value.length) return null;
    return h('div', { class: 'notification-container' },
      s.notifications.value.map(function(n) {
        return h('div', { class: ['notification', n.show ? 'show' : '', n.type], key: n.id }, [
          h('span', { class: 'notification-icon' },
            n.type === 'success' ? h('i', { class: 'fas fa-check-circle' }) :
            n.type === 'error' ? h('i', { class: 'fas fa-times-circle' }) :
            n.type === 'warning' ? h('i', { class: 'fas fa-exclamation-triangle' }) :
            h('i', { class: 'fas fa-info-circle' })
          ),
          h('span', n.message)
        ]);
      })
    );
  };
})();
