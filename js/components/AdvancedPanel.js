/* ==================== 高级设置面板组件 ==================== */
(function() {
  'use strict';
  var SNP = window.__SNP;
  SNP.components = SNP.components || {};

  SNP.components.AdvancedPanel = function(h, s, isPK) {
    return h('div', { class: 'advanced-panel' }, [
      isPK && h('div', [
        h('h5', { style: 'margin-bottom:8px;' }, [h('i', { class: 'fas fa-fist-raised' }), ' PK参数']),
        h('div', { class: 'form-group' }, [
          h('label', { class: 'form-label' }, '每边人数:'),
          h('input', { class: 'form-control', type: 'number', value: s.pkCountPerSide.value, min: 1, max: Math.max(1, Math.floor(s.totalCount.value/2)), onInput: function(e) { s.pkCountPerSide.value = parseInt(e.target.value) || 1; } })
        ]),
        s.operationMode.value === 'list' && h('div', { class: 'checkbox-group', style: 'margin:4px 0;' }, [
          h('input', { type: 'checkbox', id: 'drwGender', checked: s.genderFilter.value !== 'all', onChange: function(e) { s.genderFilter.value = e.target.checked ? 'male' : 'all'; } }),
          h('label', { for: 'drwGender', style: 'margin:0;font-size:13px;' }, '性别筛选')
        ])
      ]),
      h('h5', { style: 'margin-bottom:8px;margin-top:8px;' }, [h('i', { class: 'fas fa-ruler' }), ' 公差区间']),
      h('div', { class: 'checkbox-group', style: 'margin:4px 0;' }, [
        h('input', { type: 'checkbox', id: 'drwTol', checked: s.toleranceEnabled.value, onChange: function(e) { s.toleranceEnabled.value = e.target.checked; } }),
        h('label', { for: 'drwTol', style: 'margin:0;font-size:13px;' }, '启用公差限制')
      ]),
      s.toleranceEnabled.value && h('div', { class: 'form-group' }, [
        h('label', { class: 'form-label' }, '差值区间:'),
        h('input', { class: 'form-control', type: 'number', value: s.toleranceMin.value, min: 1, max: s.toleranceMax.value, onInput: function(e) { s.toleranceMin.value = parseInt(e.target.value) || 1; } }),
        h('span', ' ~ '),
        h('input', { class: 'form-control', type: 'number', value: s.toleranceMax.value, min: s.toleranceMin.value, max: 999, onInput: function(e) { s.toleranceMax.value = parseInt(e.target.value) || 5; } })
      ]),
      h('h5', { style: 'margin-bottom:8px;margin-top:8px;' }, [h('i', { class: 'fas fa-cog' }), ' 抽取参数']),
      h('div', { class: 'form-group' }, [
        h('label', { class: 'form-label' }, '连抽次数:'),
        h('input', { class: 'form-control', type: 'number', value: s.multiDrawCount.value, min: 1, max: 50, onInput: function(e) { s.multiDrawCount.value = parseInt(e.target.value) || 5; } })
      ]),
      h('div', { class: 'form-group' }, [
        h('label', { class: 'form-label' }, '闪动次数:'),
        h('input', { class: 'form-control', type: 'number', value: s.tensionFlashCount.value, min: 1, max: 100, onInput: function(e) { s.tensionFlashCount.value = parseInt(e.target.value) || 15; } })
      ]),
      h('div', { class: 'form-group' }, [
        h('label', { class: 'form-label' }, '闪动速度(ms):'),
        h('input', { class: 'form-control', type: 'number', value: s.tensionFlashSpeed.value, min: 20, max: 1000, step: 10, onInput: function(e) { s.tensionFlashSpeed.value = parseInt(e.target.value) || 100; } })
      ]),
      h('div', { class: 'form-group' }, [
        h('label', { class: 'form-label' }, '姓名大小:'),
        h('input', { class: 'form-control', type: 'number', value: s.nameFontSize.value, min: 1, max: 10, step: 0.5, onInput: function(e) { s.nameFontSize.value = parseFloat(e.target.value) || 5; } })
      ]),
      h('div', { class: 'form-group' }, [
        h('label', { class: 'form-label' }, '学号大小:'),
        h('input', { class: 'form-control', type: 'number', value: s.numberFontSize.value, min: 20, max: 200, onInput: function(e) { s.numberFontSize.value = parseInt(e.target.value) || 80; } })
      ]),
      h('div', { class: 'checkbox-group', style: 'margin:4px 0;' }, [
        h('input', { type: 'checkbox', id: 'drwNoRepeat', checked: s.noRepeat.value, onChange: function(e) { s.noRepeat.value = e.target.checked; } }),
        h('label', { for: 'drwNoRepeat', style: 'margin:0;font-size:13px;' }, '不重复抽取  (已抽 '+s.usedList.value.length+'/'+s.totalCount.value+')'),
        h('span', { style: 'margin-left:12px;' }),
        h('input', { type: 'checkbox', id: 'drwSound', checked: SNP.audio.isSoundOn(), onChange: function() { SNP.audio.toggleSound(); } }),
        h('label', { for: 'drwSound', style: 'margin:0 8px 0 2px;font-size:12px;' }, '🔊音效'),
        h('input', { type: 'checkbox', id: 'drwVoice', checked: SNP.audio.isVoiceOn(), onChange: function() { SNP.audio.toggleVoice(); } }),
        h('label', { for: 'drwVoice', style: 'margin:0 0 0 2px;font-size:12px;' }, '📢播报')
      ]),
      s.usedList.value.length > 0 && h('div', { style: 'margin-top:6px;display:flex;flex-wrap:wrap;gap:4px;' },
        s.usedList.value.map(function(item, i) {
          return h('span', { style: 'font-size:11px;background:var(--bg-secondary);padding:2px 8px;border-radius:10px;border:1px solid '+(i===s.usedList.value.length-1?'var(--success-color)':'var(--border-light)')+';color:'+(i===s.usedList.value.length-1?'var(--success-color)':'var(--text-tertiary)')+';' },
            (item.gender==='male'?'♂':item.gender==='female'?'♀':'') + item.student_id + (item.name?' '+item.name:'')
          );
        })
      )
    ]);
  };
})();
