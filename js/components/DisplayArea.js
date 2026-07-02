/* ==================== 显示区组件 ==================== */
(function() {
  'use strict';
  var SNP = window.__SNP;
  SNP.components = SNP.components || {};

  SNP.components.DisplayArea = function(h, s) {
    return h('div', { class: 'display-area' }, [
      s.pkResults.value.sideA.length > 0 ? [
        SNP.components.PKInlineResult(h, s)
      ] : [
        h('div', { class: ['student-name-display', s.animationClass.value], style: 'font-size:'+s.nameFontSize.value+'rem;' }, s.currentStudent.value.name || ''),
        h('div', { class: ['student-id-display', s.animationClass.value], style: 'font-size:'+s.numberFontSize.value+'pt;' }, s.currentNumber.value)
      ],
      s.multiDrawResults.value && s.multiDrawResults.value.length > 0 && h('div', { class: 'multi-results' },
        s.multiDrawResults.value.map(function(item, i) { return h('div', { class: 'result-chip', key: i }, item.student_id + (item.name ? ' ' + item.name : '')); })
      )
    ]);
  };

  SNP.components.PKInlineResult = function(h, s) {
    return h('div', { class: 'pk-results-inline' }, [
      h('div', { class: 'pk-inline-side pk-inline-a' }, [
        h('div', { class: 'pk-inline-label' }, '🔵 ' + s.pkResults.value.sideALabel),
        (s.pkResults.value.sideA || []).map(function(st) {
          return h('span', { class: 'pk-chip', key: 'a'+st.student_id }, st.student_id + (st.name ? ' ' + st.name : ''));
        })
      ]),
      h('div', { class: 'pk-inline-vs' }, '⚡ VS ⚡'),
      h('div', { class: 'pk-inline-side pk-inline-b' }, [
        h('div', { class: 'pk-inline-label' }, '🔴 ' + s.pkResults.value.sideBLabel),
        (s.pkResults.value.sideB || []).map(function(st) {
          return h('span', { class: 'pk-chip', key: 'b'+st.student_id }, st.student_id + (st.name ? ' ' + st.name : ''));
        })
      ])
    ]);
  };
})();
