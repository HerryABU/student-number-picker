/* ==================== 学生名单面板组件 ==================== */
(function() {
  'use strict';
  var SNP = window.__SNP;
  SNP.components = SNP.components || {};

  SNP.components.StudentPanel = function(h, s) {
    var sheetNames = Object.keys(s.availableSheets.value);
    var hasSheets = sheetNames.length > 1;
    var displayedStudents = s.currentStudents.value;
    if (hasSheets && s.sheetViewTag.value) {
      displayedStudents = displayedStudents.filter(function(st) { return st.sheet === s.sheetViewTag.value; });
    }

    return h('div', { class: 'student-panel' }, [
      h('h3', { style: 'margin-bottom:16px;' }, [h('i', { class: 'fas fa-users' }), ' 学生名单管理']),
      h('div', { class: 'group-tabs' }, [
        (s.studentGroups.value || []).map(function(g, i) {
          return h('div', { class: ['group-tab', { active: s.currentGroup.value === g.name }], onClick: function() { s.currentGroup.value = g.name; } }, [
            h('span', g.name+' ('+g.students.length+')'),
            h('span', { class: 'delete-icon', onClick: function(e) { e.stopPropagation(); s.showRenameGroupModal(g.name, i); } }, '✏️'),
            h('span', { class: 'delete-icon', onClick: function(e) { e.stopPropagation(); s.showDeleteGroupModal(g.name, i); } }, '❌')
          ]);
        }),
        h('button', { class: 'btn btn-primary btn-sm', onClick: s.showAddGroupModal }, [h('i', { class: 'fas fa-plus' }), ' 新建'])
      ]),
      s.hasGenderData && s.hasGenderData.value && h('div', { class: 'info-card', style: 'margin-top:8px;' }, [
        h('i', { class: 'fas fa-venus-mars' }), ' 检测到性别数据：男生 '+s.maleCount.value+' 人，女生 '+s.femaleCount.value+' 人'
      ]),
      h('div', { class: ['upload-area', { 'drag-over': s.isDragOver.value }], onClick: s.handleFileSelect, onDragover: s.handleDragOver, onDragleave: s.handleDragLeave, onDrop: s.handleDrop }, [
        h('div', { class: 'upload-icon' }, h('i', { class: 'fas fa-file-excel' })), h('h4', '点击上传Excel文件或拖拽到此'), h('p', { style: 'font-size:12px;color:var(--text-tertiary);' }, '支持 .xlsx / .xls，多Sheet全量导入，自动识别性别')
      ]),
      h('div', { class: 'upload-area', style: 'margin-top:8px;border-style:solid;', onClick: s.showPasteImportModal }, [
        h('div', { class: 'upload-icon' }, h('i', { class: 'fas fa-paste' })), h('h4', '手动粘贴数据'), h('p', { style: 'font-size:12px;color:var(--text-tertiary);' }, '每行格式：学号,姓名,性别')
      ]),
      s.isMobile && h('div', { class: 'info-card', style: 'margin-top:8px;' }, [h('i', { class: 'fas fa-mobile-alt' }), '移动端：点击上方按钮选择文件或手动粘贴']),

      // ===== Sheet子分组标签（上传区下方，表格上方） =====
      hasSheets && h('div', { style: 'margin:12px 0;padding:10px 12px;background:var(--bg-secondary);border-radius:8px;border:1px solid var(--border-light);' }, [
        h('div', { style: 'font-size:12px;font-weight:600;margin-bottom:8px;color:var(--text-secondary);' }, [
          h('i', { class: 'fas fa-layer-group' }), ' Sheet子分组  ',
          h('span', { style: 'font-weight:400;color:var(--text-tertiary);' }, '（☑勾选参与抽取 | 点击标签筛选显示）')
        ]),
        h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;' }, [
          h('button', { class: 'btn btn-outline btn-sm', onClick: s.toggleAllSheets }, s.sheetFilterEnabled.value ? '取消全选' : '全选'),
          h('div', {
            class: ['group-tab', { active: s.sheetViewTag.value === '' }],
            style: 'cursor:pointer;opacity:0.85;',
            onClick: function() { s.sheetViewTag.value = ''; }
          }, '全部 (' + s.currentStudents.value.length + ')'),
          sheetNames.map(function(name) {
            var active = s.activeSheets.value[name];
            var viewing = s.sheetViewTag.value === name;
            return h('div', {
              class: ['group-tab', { active: viewing }],
              style: 'cursor:pointer;',
              onClick: function() { s.sheetViewTag.value = viewing ? '' : name; }
            }, [
              h('input', {
                type: 'checkbox', checked: !!active,
                style: 'width:14px;height:14px;accent-color:var(--primary-color);',
                onClick: function(e) { e.stopPropagation(); s.toggleSheetFilter(name); }
              }),
              h('span', name + ' (' + s.availableSheets.value[name] + ')')
            ]);
          })
        ])
      ]),

      // ===== 学生表格 =====
      s.currentStudents.value.length > 0 ? h('div', [
        h('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin:12px 0;' }, [
          h('p', '共 ' + (hasSheets && s.sheetViewTag.value ? displayedStudents.length + '/' + s.currentStudents.value.length : s.currentStudents.value.length) + ' 名学生'),
          h('button', { class: 'btn btn-danger btn-sm', onClick: s.showClearGroupModal }, [h('i', { class: 'fas fa-trash' }), ' 清空'])
        ]),
        h('table', { class: 'student-table' }, [
          h('thead', [h('tr', [h('th', '学号'), h('th', '姓名'), h('th', '性别'), h('th', '来源'), h('th', { style: 'width:60px;' }, '操作')])]),
          h('tbody', displayedStudents.map(function(st) {
            return h('tr', { key: st.student_id }, [
              h('td', st.student_id), h('td', st.name || '—'),
              h('td', st.gender === 'male' ? '男' : st.gender === 'female' ? '女' : '—'),
              h('td', { style: 'font-size:11px;color:var(--text-tertiary);' }, st.sheet || '—'),
              h('td', [h('button', { class: 'btn btn-danger btn-sm', style: 'padding:2px 8px;font-size:12px;', onClick: function() { s.deleteStudent(st.student_id); } }, '删除')])
            ]);
          }))
        ])
      ]) : h('div', { class: 'empty-state' }, [h('i', { class: 'fas fa-upload' }), h('p', '暂无学生数据，请上传Excel文件、拖拽文件或手动粘贴')])
    ]);
  };
})();
