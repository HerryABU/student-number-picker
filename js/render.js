/* ==================== Vue渲染入口 ==================== */
(function() {
  'use strict';
  var SNP = window.__SNP;

  SNP.createRenderFn = function(ctx) {
    return function() {
      var h = Vue.h;
      var s = ctx;
      var C = SNP.components;

      function renderSetupPage() {
        return h('div', [
          h('h1', { class: 'page-title' }, [h('i', { class: 'fas fa-users-gear' }), ' 学号抽取设置', h('span', { class: 'version-badge' }, 'v6.0.0')]),
          h('div', { class: 'mode-switch-container' }, [
            h('div', { class: ['mode-card', { active: s.operationMode.value === 'range' }], onClick: function() { s.operationMode.value = 'range'; s.pkMode.value = false; } }, [
              h('div', { class: 'mode-icon' }, h('i', { class: 'fas fa-sort-numeric-up' })), h('div', { class: 'mode-title' }, '学号范围'), h('div', { class: 'mode-desc' }, '按数字区间抽取')
            ]),
            h('div', { class: ['mode-card', { active: s.operationMode.value === 'list' }], onClick: function() { s.operationMode.value = 'list'; } }, [
              h('div', { class: 'mode-icon' }, h('i', { class: 'fas fa-list-ol' })), h('div', { class: 'mode-title' }, '名单导入'), h('div', { class: 'mode-desc' }, 'Excel多表导入')
            ])
          ]),

          // PK设置面板
          s.getDrawModeValue() === 'pk' && h('div', { class: 'setting-panel' }, [
            h('h5', { style: 'margin-bottom:12px;' }, [h('i', { class: 'fas fa-fist-raised' }), ' ⚔ PK对决设置']),
            s.operationMode.value === 'list' && s.hasGenderData && s.hasGenderData.value ? h('div', { class: 'info-card', style: 'margin-bottom:12px;' }, [
              h('i', { class: 'fas fa-venus-mars' }), ' 🔵男生 '+s.maleCount.value+' 人  VS  🔴女生 '+s.femaleCount.value+' 人  |  自动按性别分队'
            ]) : h('div', { class: 'info-card', style: 'margin-bottom:12px;' }, [
              h('i', { class: 'fas fa-random' }), ' 🟢A队  VS  🟠B队  |  ', s.operationMode.value === 'range' ? '学号范围：随机均分两队' : '自由随机分队，每次重新分组'
            ]),
            h('div', { class: 'form-group' }, [
              h('label', { class: 'form-label' }, [h('i', { class: 'fas fa-users' }), ' 每边人数:']),
              h('input', { class: 'form-control', type: 'number', value: s.pkCountPerSide.value, min: 1, max: Math.max(1, Math.floor(s.totalCount.value/2)), onInput: function(e) { s.pkCountPerSide.value = parseInt(e.target.value) || 1; } })
            ]),
            s.operationMode.value === 'list' && h('div', [
              h('div', { class: 'checkbox-group', style: 'margin:8px 0;' }, [
                h('input', { type: 'checkbox', id: 'genderFilterPK', checked: s.genderFilter.value !== 'all', onChange: function(e) { s.genderFilter.value = e.target.checked ? (s.hasGenderData.value ? 'male' : 'male') : 'all'; } }),
                h('label', { for: 'genderFilterPK', style: 'margin:0;' }, '启用性别筛选')
              ]),
              s.genderFilter.value !== 'all' && h('div', { style: 'display:flex;gap:8px;justify-content:center;margin-top:8px;' }, [
                h('button', { class: ['gender-btn', { 'active-male': s.genderFilter.value === 'male' }], onClick: function() { s.genderFilter.value = 'male'; } }, '仅男生'),
                h('button', { class: ['gender-btn', { 'active-female': s.genderFilter.value === 'female' }], onClick: function() { s.genderFilter.value = 'female'; } }, '仅女生')
              ])
            ])
          ]),

          h('div', { class: 'form-group' }, [
            h('label', { class: 'form-label' }, [h('i', { class: 'fas fa-dice' }), ' 抽取模式']),
            h('div', { class: 'select-wrapper' }, [
              h('select', { class: 'form-control styled-select', value: s.getDrawModeValue(), onChange: function(e) { s.setDrawModeValue(e.target.value); } }, [
                h('option', { value: 'single' }, '🎲 单次抽取'), h('option', { value: 'quick' }, '⚡ 快速抽取'), h('option', { value: 'tension' }, '💓 惊心动魄'), h('option', { value: 'multimode' }, '🎯 多模态'), h('option', { value: 'pk' }, '⚔ PK对决')
              ]),
              h('i', { class: 'fas fa-chevron-down select-arrow' })
            ])
          ]),
          s.getDrawModeValue() === 'multimode' && h('div', { class: 'info-card' }, [h('i', { class: 'fas fa-info-circle' }), '多模态模式：抽取页面同时显示单次、快速、惊心三种抽取按钮']),

          // Range模式输入
          s.operationMode.value === 'range' && h('div', { class: 'range-inputs-centered' }, [
            h('div', { class: 'range-input-row' }, [h('label', [h('i', { class: 'fas fa-arrow-right', style: 'margin-right:8px;' }), '起始学号']), h('input', { type: 'number', value: s.startNumber.value, min: 1, onInput: function(e) { s.startNumber.value = parseInt(e.target.value) || 1; } })]),
            h('div', { class: 'range-input-row' }, [h('label', [h('i', { class: 'fas fa-arrow-left', style: 'margin-right:8px;' }), '结束学号']), h('input', { type: 'number', value: s.endNumber.value, min: s.startNumber.value, onInput: function(e) { s.endNumber.value = parseInt(e.target.value) || s.startNumber.value; } })])
          ]),

          // List模式学生面板
          s.operationMode.value === 'list' && C.StudentPanel(h, s),

          h('div', { class: 'checkbox-group' }, [h('input', { type: 'checkbox', id: 'noRepeat', checked: s.noRepeat.value, onChange: function(e) { s.noRepeat.value = e.target.checked; } }), h('label', { for: 'noRepeat', style: 'margin:0;' }, '不重复抽取')]),
          h('div', { class: 'btn-group' }, [h('button', { class: 'btn btn-primary', disabled: s.operationMode.value === 'list' && s.currentStudents.value.length === 0, onClick: s.startDraw }, [h('i', { class: 'fas fa-play' }), ' 开始抽取'])]),

          // 高级设置
          h('div', { class: 'advanced-section' }, [
            h('div', { class: 'advanced-toggle', onClick: function() { s.showAdvanced.value = !s.showAdvanced.value; } }, [
              h('i', { class: 'fas fa-chevron-'+(s.showAdvanced.value ? 'up' : 'down') }), ' '+(s.showAdvanced.value ? '隐藏' : '显示')+'高级设置'
            ]),
            s.showAdvanced.value && C.SetupAdvancedPanel(h, s)
          ])
        ]);
      }

      function renderDrawPage() {
        var isPK = s.drawMode.value === 'pk' || s.pkMode.value;

        return h('div', [
          h('h1', { class: 'page-title', style: 'margin-bottom:16px;' }, [h('i', { class: 'fas fa-shuffle' }), ' 学号抽取', h('span', { class: 'version-badge' }, 'v6.0.0')]),
          s.operationMode.value === 'list' && h('div', { style: 'text-align:center;margin-bottom:12px;font-size:13px;color:var(--text-tertiary);' }, [
            '分组: '+s.currentGroup.value+' | 总人数: '+s.totalCount.value+' | 剩余: '+s.availableCount.value
          ]),

          C.DisplayArea(h, s),

          // 按钮区
          C.DrawButtons(h, s),

          // 批量面板
          s.showBatchPanel.value && h('div', { style: 'margin-top:16px;padding:16px;background:var(--bg-tertiary);border-radius:8px;' }, [
            h('div', { class: 'form-group' }, [h('label', { class: 'form-label' }, '连抽次数:'), h('input', { class: 'form-control', type: 'number', value: s.multiDrawCount.value, min: 1, max: 50, onInput: function(e) { s.multiDrawCount.value = parseInt(e.target.value) || 5; } })]),
            h('div', { class: 'form-group' }, [h('label', { class: 'form-label' }, '抽取人数:'), h('input', { class: 'form-control', type: 'number', value: s.batchDrawCount.value, min: 1, max: s.availableCount.value, onInput: function(e) { s.batchDrawCount.value = parseInt(e.target.value) || 1; } })]),
            h('button', { class: 'btn btn-primary', onClick: s.drawBatchWithAnimation }, [h('i', { class: 'fas fa-user-friends' }), ' 抽取'+s.batchDrawCount.value+'人'])
          ]),

          C.HistoryList(h, s),

          // 高级设置（下方）
          h('div', { class: 'advanced-section' }, [
            h('div', { class: 'advanced-toggle', onClick: function() { s.showDrawSettings.value = !s.showDrawSettings.value; } }, [
              h('i', { class: 'fas fa-chevron-'+(s.showDrawSettings.value ? 'up' : 'down') }), ' '+(s.showDrawSettings.value ? '隐藏' : '显示')+'高级设置'
            ]),
            s.showDrawSettings.value && C.AdvancedPanel(h, s, isPK)
          ])
        ]);
      }

      return h('div', { class: 'main-card' }, [
        h('button', { class: 'theme-toggle-btn', onClick: function() { s.darkMode.value = !s.darkMode.value; } }, h('i', { class: 'fas fa-'+(s.darkMode.value ? 'sun' : 'moon') })),
        h('button', { class: 'share-btn', onClick: s.copyShareLink }, h('i', { class: 'fas fa-share-alt' })),

        s.isSetupPage.value ? renderSetupPage() : renderDrawPage(),

        C.Fullscreen(h, s),
        C.Celebration(h, s),
        C.Modals(h, s),
        C.Notifications(h, s),

        h('div', { class: 'footer' }, ['智能学号抽取系统 V6.0.0 | ', h('a', { href: 'https://github.com/HerryABU/student-number-picker', target: '_blank' }, 'GitHub'), ' | ', h('a', { href: 'https://blog.csdn.net/Herryfyh', target: '_blank' }, 'CSDN')])
      ]);
    };
  };
})();
