/* ==================== 设置页高级设置面板组件 ==================== */
(function() {
  'use strict';
  var SNP = window.__SNP;
  SNP.components = SNP.components || {};

  SNP.components.SetupAdvancedPanel = function(h, s) {
    return h('div', { class: 'advanced-panel' }, [
      h('h4', { style: 'margin-bottom:16px;' }, [h('i', { class: 'fas fa-sliders-h' }), ' 高级选项']),

      s.operationMode.value === 'range' && h('div', [
        h('h5', { style: 'margin-bottom:12px;' }, [h('i', { class: 'fas fa-percentage' }), ' 概率权重设置']),
        h('p', { style: 'font-size:12px;color:var(--text-tertiary);margin-bottom:12px;' }, '设置不同学号范围的抽取概率权重'),
        (s.probabilityRanges.value || []).map(function(r, i) {
          return h('div', { class: 'probability-item', key: i }, [
            h('input', { type: 'number', value: r.start, min: s.startNumber.value, max: r.end, onInput: function(e) { r.start = parseInt(e.target.value) || s.startNumber.value; } }), h('span', '至'),
            h('input', { type: 'number', value: r.end, min: r.start, max: s.endNumber.value, onInput: function(e) { r.end = parseInt(e.target.value) || r.start; } }), h('span', '权重'),
            h('input', { type: 'number', value: r.weight, min: 1, style: 'width:80px;', onInput: function(e) { r.weight = parseInt(e.target.value) || 1; } }),
            h('button', { class: 'btn btn-danger btn-sm', onClick: function() { s.probabilityRanges.value.splice(i, 1); } }, '删除')
          ]);
        }),
        h('button', { class: 'btn btn-outline btn-sm', onClick: function() { s.probabilityRanges.value.push({ start: s.startNumber.value, end: s.endNumber.value, weight: 1 }); } }, '添加区间')
      ]),

      s.operationMode.value === 'list' && h('div', { style: 'margin-top:16px;' }, [
        h('h5', { style: 'margin-bottom:12px;' }, [h('i', { class: 'fas fa-venus-mars' }), ' 性别筛选（非PK模式）']),
        h('div', { style: 'display:flex;gap:8px;justify-content:center;margin-bottom:16px;' }, [
          h('button', { class: ['gender-btn', { 'active-all': s.genderFilter.value === 'all' }], onClick: function() { s.genderFilter.value = 'all'; } }, '全部'),
          h('button', { class: ['gender-btn', { 'active-male': s.genderFilter.value === 'male' }], onClick: function() { s.genderFilter.value = 'male'; }, disabled: !s.hasGenderData.value }, '仅男生'),
          h('button', { class: ['gender-btn', { 'active-female': s.genderFilter.value === 'female' }], onClick: function() { s.genderFilter.value = 'female'; }, disabled: !s.hasGenderData.value }, '仅女生')
        ]),
        !s.hasGenderData.value && h('p', { style: 'font-size:11px;color:var(--text-tertiary);text-align:center;margin-bottom:12px;' }, '提示：导入数据时需包含性别列（男/女）才能使用性别筛选'),

        h('h5', { style: 'margin-bottom:12px;margin-top:16px;' }, [h('i', { class: 'fas fa-ruler' }), ' 抽取公差区间']),
        h('div', { class: 'checkbox-group', style: 'margin:8px 0;' }, [h('input', { type: 'checkbox', id: 'tolEnabled', checked: s.toleranceEnabled.value, onChange: function(e) { s.toleranceEnabled.value = e.target.checked; } }), h('label', { for: 'tolEnabled', style: 'margin:0;' }, '启用公差限制')]),
        s.toleranceEnabled.value && h('div', { class: 'form-group' }, [
          h('label', { class: 'form-label' }, '差值区间:'),
          h('input', { class: 'form-control', type: 'number', value: s.toleranceMin.value, min: 1, max: s.toleranceMax.value, onInput: function(e) { s.toleranceMin.value = parseInt(e.target.value) || 1; } }),
          h('span', ' ~ '),
          h('input', { class: 'form-control', type: 'number', value: s.toleranceMax.value, min: s.toleranceMin.value, max: 999, onInput: function(e) { s.toleranceMax.value = parseInt(e.target.value) || 5; } })
        ])
      ]),

      h('h5', { style: 'margin-bottom:12px;margin-top:16px;' }, [h('i', { class: 'fas fa-cog' }), ' 抽取参数']),
      h('div', { class: 'form-group' }, [h('label', { class: 'form-label' }, '连抽次数:'), h('input', { class: 'form-control', type: 'number', value: s.multiDrawCount.value, min: 1, max: 50, onInput: function(e) { s.multiDrawCount.value = parseInt(e.target.value) || 5; } })]),
      h('div', { class: 'form-group' }, [h('label', { class: 'form-label' }, '批量人数:'), h('input', { class: 'form-control', type: 'number', value: s.batchDrawCount.value, min: 1, max: 50, onInput: function(e) { s.batchDrawCount.value = parseInt(e.target.value) || 1; } })]),
      h('div', { class: 'form-group' }, [h('label', { class: 'form-label' }, '闪动次数:'), h('input', { class: 'form-control', type: 'number', value: s.tensionFlashCount.value, min: 1, max: 100, onInput: function(e) { s.tensionFlashCount.value = parseInt(e.target.value) || 15; } })]),
      h('div', { class: 'form-group' }, [h('label', { class: 'form-label' }, '闪动速度(ms):'), h('input', { class: 'form-control', type: 'number', value: s.tensionFlashSpeed.value, min: 20, max: 1000, step: 10, onInput: function(e) { s.tensionFlashSpeed.value = parseInt(e.target.value) || 100; } })]),
      h('div', { class: 'form-group' }, [h('label', { class: 'form-label' }, '姓名字号(rem):'), h('input', { class: 'form-control', type: 'number', value: s.nameFontSize.value, min: 1, max: 10, step: 0.5, onInput: function(e) { s.nameFontSize.value = parseFloat(e.target.value) || 5; } })]),
      h('div', { class: 'form-group' }, [h('label', { class: 'form-label' }, '学号字号(pt):'), h('input', { class: 'form-control', type: 'number', value: s.numberFontSize.value, min: 20, max: 200, onInput: function(e) { s.numberFontSize.value = parseInt(e.target.value) || 80; } })])
    ]);
  };
})();
