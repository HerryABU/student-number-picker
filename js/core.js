/* ==================== 核心工具模块 ==================== */
(function() {
  'use strict';
  var SNP = window.__SNP = window.__SNP || {};
  
  // 文件选择（支持手机）
  SNP.selectExcelFile = function(callback) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';
    input.onchange = function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(evt) { if (callback) callback(evt.target.result); };
      reader.onerror = function() { if (callback) callback(null); };
      reader.readAsArrayBuffer(file);
    };
    input.click();
  };
  
  // 性别检测
  SNP.detectGender = function(value) {
    if (!value) return '';
    var v = String(value).trim();
    if (/^(男|m|male|♂|boy|1)$/i.test(v)) return 'male';
    if (/^(女|f|female|♀|girl|0|2)$/i.test(v)) return 'female';
    return '';
  };
  
  SNP.isGenderColumnName = function(name) {
    if (!name) return false;
    return /^(性别|sex|gender|男女)$/i.test(String(name).trim());
  };

  // Excel多Sheet解析
  SNP.parseExcelAllSheets = function(arrayBuffer, onSuccess, onError) {
    if (typeof XLSX === 'undefined') { if (onError) onError('XLSX库未加载'); return; }
    if (!arrayBuffer) { if (onError) onError('文件读取失败'); return; }
    try {
      var wb = XLSX.read(arrayBuffer, { type: 'array' });
      var allSheets = [];
      for (var si = 0; si < wb.SheetNames.length; si++) {
        var sheetName = wb.SheetNames[si];
        var ws = wb.Sheets[sheetName];
        var rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        var students = [];
        var genderColIndex = -1;
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          if (!row || row.length === 0) continue;
          if (i === 0 && row.length > 2) {
            for (var j = 0; j < row.length; j++) {
              if (SNP.isGenderColumnName(row[j])) { genderColIndex = j; break; }
            }
          }
          var studentId = String(row[0] || '').trim();
          if (!studentId) continue;
          var name = row.length > 1 ? String(row[1] || '').trim() : '';
          var gender = '';
          if (genderColIndex >= 0 && row.length > genderColIndex) {
            gender = SNP.detectGender(row[genderColIndex]);
          } else if (row.length > 2 && i > 0) {
            gender = SNP.detectGender(row[2]);
          }
          students.push({ student_id: studentId, name: name || '', gender: gender, sheet: sheetName });
        }
        if (students.length > 0) {
          allSheets.push({ name: sheetName, rowCount: students.length, students: students });
        }
      }
      if (allSheets.length === 0) { if (onError) onError('未找到有效数据'); return; }
      if (onSuccess) onSuccess(allSheets);
    } catch (err) { if (onError) onError('解析失败: ' + err.message); }
  };
  
  SNP.importFromPasteText = function(text, onSuccess, onError) {
    if (typeof text !== 'string') { if (onError) onError('无效数据格式'); return; }
    var lines = text.split(/\r?\n/);
    var students = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line === '') continue;
      var parts = line.split(/[,\t\s]+/);
      if (parts.length >= 1) {
        var studentId = parts[0].trim();
        var name = '';
        var gender = '';
        if (parts.length >= 3) {
          var lastPart = parts[parts.length - 1].trim();
          var g = SNP.detectGender(lastPart);
          if (g) { gender = g; name = parts.slice(1, parts.length - 1).join(' ').trim(); }
          else { name = parts.slice(1).join(' ').trim(); }
        } else if (parts.length >= 2) {
          name = parts.slice(1).join(' ').trim();
        }
        if (studentId) students.push({ student_id: studentId, name: name, gender: gender });
      }
    }
    if (students.length === 0) { if (onError) onError('未找到有效数据'); return; }
    if (onSuccess) onSuccess(students);
  };
})();
