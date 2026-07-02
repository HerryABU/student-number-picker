/* ==================== Vue应用状态与逻辑模块 ==================== */
(function() {
  'use strict';
  var SNP = window.__SNP;
  
  SNP.createApp = function() {
    var _a = Vue, createApp = _a.createApp, ref = _a.ref, computed = _a.computed, onMounted = _a.onMounted, watch = _a.watch;
    
    var App = {
      setup: function() {
        var isSetupPage = ref(true);
        var darkMode = ref(false);
        var showAdvanced = ref(false);
        var showBatchPanel = ref(false);
        var showModal = ref(false);
        var showFullscreenEffect = ref(false);
        var showCelebration = ref(false);
        var isContinuous = ref(false);
        var animationClass = ref('');
        var isDragOver = ref(false);
        
        var modalConfig = ref({ title: '', message: '', confirmText: '确定', danger: false, onConfirm: null, inputRequired: false, inputValue: '', inputPlaceholder: '' });
        var notifications = ref([]);
        
        var operationMode = ref('range');
        var startNumber = ref(1);
        var endNumber = ref(40);
        var drawMode = ref('single');
        var noRepeat = ref(true);
        var nameFontSize = ref(5);
        var numberFontSize = ref(80);
        var multiDrawCount = ref(5);
        var batchDrawCount = ref(3);
        var tensionFlashCount = ref(15);
        var tensionFlashSpeed = ref(100);
        
        var probabilityRanges = ref([]);
        var studentGroups = ref([{ name: '默认组', students: [] }]);
        var currentGroup = ref('默认组');
        
        var currentNumber = ref('—');
        var currentStudent = ref({ student_id: '', name: '', gender: '' });
        var usedList = ref([]);
        var multiDrawResults = ref([]);
        
        var fullscreenNumber = ref('');
        var fullscreenName = ref('');
        var fullscreenResults = ref([]);
        var celebrationMessage = ref('');
        
        // 新功能state
        var genderFilter = ref('all');
        var pkMode = ref(false);
        var pkCountPerSide = ref(3);
        var pkResults = ref({ sideA: [], sideB: [], sideALabel: 'A阵营', sideBLabel: 'B阵营' });
        var toleranceEnabled = ref(false);
        var toleranceMin = ref(1);
        var toleranceMax = ref(5);
        var activeSheets = ref({});
        var sheetFilterEnabled = ref(false);
        var sheetViewTag = ref('');
        
        var continuousTimer = ref(null), tensionTimer = ref(null), fullscreenTimer = ref(null), celebrationTimer = ref(null);
        var showDrawSettings = ref(false);
        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        var getDrawModeValue = function() { return drawMode.value; };
        var setDrawModeValue = function(val) { drawMode.value = val; };
        
        var currentStudents = computed(function() {
          var g = studentGroups.value.find(function(g) { return g.name === currentGroup.value; });
          return g ? g.students : [];
        });
        
        var totalCount = computed(function() {
          return operationMode.value === 'list' ? currentStudents.value.length : Math.max(0, endNumber.value - startNumber.value + 1);
        });
        
        var availableCount = computed(function() { return totalCount.value - usedList.value.length; });
        
        var hasGenderData = computed(function() {
          return currentStudents.value.some(function(s) { return s.gender === 'male' || s.gender === 'female'; });
        });
        
        var maleCount = computed(function() { return currentStudents.value.filter(function(s) { return s.gender === 'male'; }).length; });
        var femaleCount = computed(function() { return currentStudents.value.filter(function(s) { return s.gender === 'female'; }).length; });
        var availableSheets = computed(function() {
          var sheets = {};
          for (var i = 0; i < currentStudents.value.length; i++) {
            var sh = currentStudents.value[i].sheet;
            if (sh) sheets[sh] = (sheets[sh] || 0) + 1;
          }
          return sheets;
        });
        
        // URL参数
        var encodeProbabilityRanges = function() {
          if (!probabilityRanges.value.length) return '';
          return probabilityRanges.value.map(function(r) { return r.start+'-'+r.end+'-'+r.weight; }).join(',');
        };
        
        var decodeProbabilityRanges = function(str) {
          if (!str) return [];
          return str.split(',').map(function(part) {
            var parts = part.split('-');
            if (parts.length !== 3) return null;
            var s = parseInt(parts[0]), e = parseInt(parts[1]), w = parseInt(parts[2]);
            if (isNaN(s) || isNaN(e) || isNaN(w)) return null;
            return { start: s, end: e, weight: w };
          }).filter(function(r) { return r !== null; });
        };
        
        var updateUrlParams = function() {
          var params = new URLSearchParams();
          params.set('mode', operationMode.value);
          params.set('draw', getDrawModeValue());
          params.set('norepeat', noRepeat.value ? 'true' : 'false');
          params.set('darkmode', darkMode.value ? 'true' : 'false');
          if (operationMode.value === 'range') {
            params.set('start', String(startNumber.value));
            params.set('end', String(endNumber.value));
          }
          params.set('namesize', String(nameFontSize.value));
          params.set('numbersize', String(numberFontSize.value));
          params.set('multicount', String(multiDrawCount.value));
          params.set('batchcount', String(batchDrawCount.value));
          params.set('flashcount', String(tensionFlashCount.value));
          params.set('flashspeed', String(tensionFlashSpeed.value));
          var probStr = encodeProbabilityRanges();
          if (probStr) params.set('probability', probStr);
          params.set('gender', genderFilter.value);
          params.set('pkmode', pkMode.value ? 'true' : 'false');
          params.set('pkcount', String(pkCountPerSide.value));
          params.set('tol_min', String(toleranceMin.value));
          params.set('tol_max', String(toleranceMax.value));
          params.set('tol_enabled', toleranceEnabled.value ? 'true' : 'false');
          params.set('sound', SNP.audio.isSoundOn() ? 'true' : 'false');
          params.set('voice', SNP.audio.isVoiceOn() ? 'true' : 'false');
          params.set('sheet_filter', sheetFilterEnabled.value ? 'true' : 'false');
          window.history.replaceState(null, '', window.location.pathname + '?' + params.toString());
        };
        
        var loadFromUrlParams = function() {
          var params = new URLSearchParams(window.location.search);
          if (params.has('mode')) { var m = params.get('mode'); if (m === 'range' || m === 'list') operationMode.value = m; }
          if (params.has('draw')) { var d = params.get('draw'); if (['single','quick','tension','multimode','pk'].indexOf(d) !== -1) setDrawModeValue(d); }
          if (params.has('norepeat')) noRepeat.value = params.get('norepeat') === 'true';
          if (params.has('darkmode')) {
            var dm = params.get('darkmode') === 'true';
            if (dm !== darkMode.value) { darkMode.value = dm; document.body.classList.toggle('dark-mode', dm); localStorage.setItem('darkMode', dm); }
          }
          if (params.has('start')) startNumber.value = parseInt(params.get('start')) || 1;
          if (params.has('end')) endNumber.value = parseInt(params.get('end')) || 40;
          if (params.has('namesize')) nameFontSize.value = parseFloat(params.get('namesize')) || 5;
          if (params.has('numbersize')) numberFontSize.value = parseInt(params.get('numbersize')) || 80;
          if (params.has('multicount')) multiDrawCount.value = parseInt(params.get('multicount')) || 5;
          if (params.has('batchcount')) batchDrawCount.value = parseInt(params.get('batchcount')) || 3;
          if (params.has('flashcount')) tensionFlashCount.value = parseInt(params.get('flashcount')) || 15;
          if (params.has('flashspeed')) tensionFlashSpeed.value = parseInt(params.get('flashspeed')) || 100;
          if (params.has('probability')) { var decoded = decodeProbabilityRanges(params.get('probability')); if (decoded.length > 0) probabilityRanges.value = decoded; }
          if (params.has('gender')) { var g = params.get('gender'); genderFilter.value = (g === 'male' || g === 'female') ? g : 'all'; }
          if (params.has('pkmode')) pkMode.value = params.get('pkmode') === 'true';
          if (params.has('pkcount')) pkCountPerSide.value = parseInt(params.get('pkcount')) || 3;
          if (params.has('tol_min')) toleranceMin.value = parseInt(params.get('tol_min')) || 1;
          if (params.has('tol_max')) toleranceMax.value = parseInt(params.get('tol_max')) || 5;
          if (params.has('tol_enabled')) toleranceEnabled.value = params.get('tol_enabled') === 'true';
          if (params.has('sound') && params.get('sound') === 'false') { while (SNP.audio.isSoundOn()) SNP.audio.toggleSound(); }
          if (params.has('voice') && params.get('voice') === 'true') { while (!SNP.audio.isVoiceOn()) SNP.audio.toggleVoice(); }
          if (params.has('sheet_filter')) sheetFilterEnabled.value = params.get('sheet_filter') === 'true';
          setTimeout(function() {
            document.documentElement.style.setProperty('--name-size', nameFontSize.value + 'rem');
            document.documentElement.style.setProperty('--number-size', numberFontSize.value + 'pt');
          }, 50);
        };
        
        // 通知
        var showNotification = function(message, type) {
          type = type || 'info';
          var id = Date.now() + Math.random();
          notifications.value.push({ id: id, message: message, type: type, show: false });
          for (var i = 0; i < notifications.value.length; i++) {
            if (notifications.value[i].id === id) {
              var current = notifications.value[i];
              setTimeout(function() { current.show = true; }, 10);
              setTimeout(function() {
                var idx = notifications.value.findIndex(function(n) { return n.id === id; });
                if (idx >= 0) notifications.value.splice(idx, 1);
              }, 3000);
              break;
            }
          }
        };
        
        var triggerCelebration = function() {
          celebrationMessage.value = '全部抽完啦! 🎉';
          showCelebration.value = true;
          if (celebrationTimer.value) clearTimeout(celebrationTimer.value);
          celebrationTimer.value = setTimeout(function() { showCelebration.value = false; }, 2500);
          SNP.audio.playCelebration();
        };
        
        var addToUsed = function(item) {
          if (!item) return false;
          if (!usedList.value.some(function(u) { return String(u.student_id) === String(item.student_id); })) {
            usedList.value.push(JSON.parse(JSON.stringify(item)));
            return true;
          }
          return false;
        };
        
        var applyAnimation = function(cls) { animationClass.value = cls; setTimeout(function() { animationClass.value = ''; }, 500); };
        
        // 核心抽取逻辑
        var getAllItems = function() {
          if (operationMode.value === 'list') {
            return currentStudents.value.map(function(s) { return { student_id: String(s.student_id), name: s.name || '', gender: s.gender || '' }; });
          } else {
            var items = [];
            for (var i = startNumber.value; i <= endNumber.value; i++) items.push({ student_id: String(i), name: '', gender: '' });
            return items;
          }
        };
        
        var isUsed = function(item) { return item && usedList.value.some(function(u) { return String(u.student_id) === String(item.student_id); }); };
        
        var getAvailableItems = function() {
          var items = getAllItems();
          
          if (operationMode.value === 'list' && genderFilter.value !== 'all') {
            items = items.filter(function(s) { return s.gender === genderFilter.value; });
          }
          
          if (operationMode.value === 'list' && sheetFilterEnabled.value) {
            items = items.filter(function(s) { return activeSheets.value[s.sheet]; });
          }
          
          if (operationMode.value === 'range' && probabilityRanges.value.length > 0) {
            var weighted = [];
            for (var ri = 0; ri < probabilityRanges.value.length; ri++) {
              var r = probabilityRanges.value[ri];
              var rangeItems = items.filter(function(item) { var id = parseInt(item.student_id); return id >= r.start && id <= r.end && !isUsed(item); });
              for (var w = 0; w < r.weight; w++) weighted.push.apply(weighted, rangeItems);
            }
            var covered = new Set();
            probabilityRanges.value.forEach(function(r) { for (var i2 = r.start; i2 <= r.end; i2++) covered.add(i2); });
            var uncovered = items.filter(function(item) { var id = parseInt(item.student_id); return !covered.has(id) && !isUsed(item); });
            items = weighted.concat(uncovered);
            return items;
          }
          
          items = items.filter(function(item) { return !isUsed(item); });
          
          if (toleranceEnabled.value && usedList.value.length > 0) {
            var lastId = usedList.value[usedList.value.length - 1].student_id;
            var lastNum = parseInt(lastId);
            if (!isNaN(lastNum)) {
              var filtered = items.filter(function(s) {
                var num = parseInt(s.student_id);
                if (isNaN(num)) return true;
                var diff = Math.abs(num - lastNum);
                return diff >= toleranceMin.value && diff <= toleranceMax.value;
              });
              if (filtered.length > 0) items = filtered;
            }
          }
          
          return items;
        };
        
        var isPKMode = function() { return drawMode.value === 'pk' || pkMode.value; };
        var resetPKDisplay = function() {
          pkResults.value = { sideA: [], sideB: [], sideALabel: 'A阵营', sideBLabel: 'B阵营' };
        };

        // 抽取函数
        var drawSingle = function() {
          multiDrawResults.value = [];
          resetPKDisplay();
          if (isPKMode()) { doPK(); return; }
          var available = getAvailableItems();
          if (available.length === 0) { triggerCelebration(); return; }
          var idx = Math.floor(Math.random() * available.length);
          var item = JSON.parse(JSON.stringify(available[idx]));
          applyAnimation(['anim-flip','anim-pop','anim-slide'][Math.floor(Math.random() * 3)]);
          if (noRepeat.value) addToUsed(item);
          currentNumber.value = item.student_id;
          currentStudent.value = JSON.parse(JSON.stringify(item));
          multiDrawResults.value = [JSON.parse(JSON.stringify(item))];
          if (availableCount.value === 0) triggerCelebration();
          SNP.audio.playDraw();
          SNP.audio.speak(item.student_id + (item.name || ''));
        };
        
        var toggleContinuous = function() {
          if (isContinuous.value) {
            clearInterval(continuousTimer.value);
            isContinuous.value = false;
            if (currentNumber.value !== '—' && noRepeat.value) {
              var finalItem = { student_id: currentNumber.value, name: currentStudent.value.name, gender: currentStudent.value.gender || '' };
              if (!usedList.value.some(function(u) { return u.student_id === finalItem.student_id; })) usedList.value.push(finalItem);
            }
            multiDrawResults.value = [{ student_id: currentNumber.value, name: currentStudent.value.name, gender: currentStudent.value.gender || '' }];
            if (availableCount.value === 0) triggerCelebration();
          } else {
            isContinuous.value = true;
            continuousTimer.value = setInterval(function() {
              var available = getAvailableItems();
              if (available.length === 0) { clearInterval(continuousTimer.value); isContinuous.value = false; triggerCelebration(); return; }
              var idx = Math.floor(Math.random() * available.length);
              currentNumber.value = available[idx].student_id;
              currentStudent.value = JSON.parse(JSON.stringify(available[idx]));
            }, 40);
          }
        };
        
        var startTension = function() {
          if (tensionTimer.value) { clearInterval(tensionTimer.value); tensionTimer.value = null; }
          var available = getAvailableItems();
          if (available.length === 0) { triggerCelebration(); return; }
          if (available.length === 1) {
            var item = available[0];
            applyAnimation('anim-pop');
            if (noRepeat.value) addToUsed(item);
            currentNumber.value = item.student_id;
            currentStudent.value = JSON.parse(JSON.stringify(item));
            multiDrawResults.value = [JSON.parse(JSON.stringify(item))];
            return;
          }
          var count = 0;
          var finalIdx = Math.floor(Math.random() * available.length);
          var finalItem = JSON.parse(JSON.stringify(available[finalIdx]));
          tensionTimer.value = setInterval(function() {
            count++;
            var now = getAvailableItems();
            if (now.length === 0) { clearInterval(tensionTimer.value); tensionTimer.value = null; triggerCelebration(); return; }
            var idx = Math.floor(Math.random() * now.length);
            currentNumber.value = now[idx].student_id;
            currentStudent.value = JSON.parse(JSON.stringify(now[idx]));
            if (count >= tensionFlashCount.value) {
              clearInterval(tensionTimer.value); tensionTimer.value = null;
              applyAnimation('anim-pop');
              if (noRepeat.value) addToUsed(finalItem);
              currentNumber.value = finalItem.student_id;
              currentStudent.value = JSON.parse(JSON.stringify(finalItem));
              multiDrawResults.value = [JSON.parse(JSON.stringify(finalItem))];
              if (availableCount.value === 0) triggerCelebration();
            }
          }, tensionFlashSpeed.value);
        };
        
        var drawMultiWithAnimation = function() {
          resetPKDisplay();
          if (isPKMode()) { doPKWithAnimation(); return; }
          var available = getAvailableItems();
          var count = Math.min(multiDrawCount.value, available.length);
          if (count === 0) { showNotification('没有可抽取的学号！', 'warning'); return; }
          if (fullscreenTimer.value) { clearInterval(fullscreenTimer.value); fullscreenTimer.value = null; }
          showFullscreenEffect.value = true;
          fullscreenResults.value = [];
          var results = [];
          var temp = available.map(function(i) { return JSON.parse(JSON.stringify(i)); });
          var idx = 0;
          fullscreenTimer.value = setInterval(function() {
            if (idx >= count || temp.length === 0) {
              clearInterval(fullscreenTimer.value); fullscreenTimer.value = null;
              setTimeout(function() {
                showFullscreenEffect.value = false;
                if (results.length) {
                  multiDrawResults.value = results;
                  var last = results[results.length - 1];
                  currentNumber.value = last.student_id;
                  currentStudent.value = JSON.parse(JSON.stringify(last));
                  showNotification('成功抽取 '+results.length+' 人');
                }
                if (availableCount.value === 0) triggerCelebration();
              }, 800);
              return;
            }
            var rIdx = Math.floor(Math.random() * temp.length);
            var item = temp[rIdx];
            var saved = JSON.parse(JSON.stringify(item));
            results.push(saved);
            fullscreenResults.value.push(saved);
            fullscreenNumber.value = item.student_id;
            fullscreenName.value = item.name || '';
            if (noRepeat.value) addToUsed(item);
            temp.splice(rIdx, 1);
            idx++;
          }, 250);
        };
        
        var drawBatchWithAnimation = function() {
          var available = getAvailableItems();
          var count = Math.min(batchDrawCount.value, available.length);
          if (count === 0) { showNotification('没有可抽取的学号！', 'warning'); return; }
          var results = [];
          var temp = available.map(function(i) { return JSON.parse(JSON.stringify(i)); });
          for (var i = 0; i < count && temp.length > 0; i++) {
            var idx = Math.floor(Math.random() * temp.length);
            var item = temp[idx];
            results.push(JSON.parse(JSON.stringify(item)));
            if (noRepeat.value) addToUsed(item);
            temp.splice(idx, 1);
          }
          multiDrawResults.value = results;
          if (results.length) {
            currentNumber.value = results[results.length - 1].student_id;
            currentStudent.value = JSON.parse(JSON.stringify(results[results.length - 1]));
          }
          showNotification('成功抽取 ' + results.length + ' 人', 'success');
          if (availableCount.value === 0) triggerCelebration();
        };
        
        // ========== PK模式 ==========
        var preparePKSides = function() {
          var groups = getPKGroups();
          var filterUnused = function(arr) {
            return arr.filter(function(s) { return !isUsed(s); });
          };
          var sideAPool = filterUnused(groups.sideA);
          var sideBPool = filterUnused(groups.sideB);
          var count = Math.min(pkCountPerSide.value, sideAPool.length, sideBPool.length);
          if (count === 0) { showNotification('某一阵营无可抽取的学生！', 'warning'); return null; }
          return {
            sideALabel: groups.sideALabel, sideBLabel: groups.sideBLabel, count: count,
            tempA: sideAPool.map(function(i) { return JSON.parse(JSON.stringify(i)); }),
            tempB: sideBPool.map(function(i) { return JSON.parse(JSON.stringify(i)); })
          };
        };

        var buildPKResult = function(pickedA, pickedB, labelA, labelB, count) {
          pkResults.value = { sideA: pickedA, sideB: pickedB, sideALabel: labelA, sideBLabel: labelB };
          multiDrawResults.value = null;
          currentNumber.value = 'VS';
          currentStudent.value = { student_id: 'VS', name: labelA + ' vs ' + labelB, gender: '' };
          showNotification('PK: ' + labelA + ' ' + count + '人 VS ' + labelB + ' ' + count + '人', 'success');
        };

        var getPKGroups = function() {
          var all;
          if (operationMode.value === 'list') {
            all = JSON.parse(JSON.stringify(currentStudents.value));
          } else {
            all = getAllItems();
          }
          if (operationMode.value === 'list' && hasGenderData.value) {
            var sideA = all.filter(function(s) { return s.gender === 'male'; });
            var sideB = all.filter(function(s) { return s.gender === 'female'; });
            return { sideA: sideA, sideB: sideB, sideALabel: '男生', sideBLabel: '女生' };
          }
          // 自由分组（学号范围 or 名单无性别）：随机打乱后均分两队
          var shuffled = all.sort(function() { return Math.random() - 0.5; });
          var mid = Math.ceil(shuffled.length / 2);
          return { sideA: shuffled.slice(0, mid), sideB: shuffled.slice(mid), sideALabel: 'A队', sideBLabel: 'B队' };
        };
        
        var doPK = function() {
          var info = preparePKSides(); if (!info) return;
          var pickedA = [], pickedB = [];
          for (var i = 0; i < info.count; i++) {
            var ia = Math.floor(Math.random() * info.tempA.length);
            pickedA.push(JSON.parse(JSON.stringify(info.tempA[ia])));
            if (noRepeat.value) addToUsed(info.tempA[ia]); info.tempA.splice(ia, 1);
            var ib = Math.floor(Math.random() * info.tempB.length);
            pickedB.push(JSON.parse(JSON.stringify(info.tempB[ib])));
            if (noRepeat.value) addToUsed(info.tempB[ib]); info.tempB.splice(ib, 1);
          }
          buildPKResult(pickedA, pickedB, info.sideALabel, info.sideBLabel, pickedA.length);
          applyAnimation('anim-pop');
          SNP.audio.playPK();
        };
        
        var doPKWithAnimation = function() {
          var info = preparePKSides(); if (!info) return;
          if (fullscreenTimer.value) { clearInterval(fullscreenTimer.value); fullscreenTimer.value = null; }
          showFullscreenEffect.value = true;
          fullscreenResults.value = [];
          var pickedA = [], pickedB = [];
          var idx = 0, total = info.count * 2;
          fullscreenTimer.value = setInterval(function() {
            if (idx >= total) {
              clearInterval(fullscreenTimer.value); fullscreenTimer.value = null;
              setTimeout(function() {
                showFullscreenEffect.value = false;
                buildPKResult(pickedA, pickedB, info.sideALabel, info.sideBLabel, info.count);
              }, 800);
              return;
            }
            var fromA = idx % 2 === 0;
            if (fromA && info.tempA.length > 0) {
              var ia = Math.floor(Math.random() * info.tempA.length);
              pickedA.push(JSON.parse(JSON.stringify(info.tempA[ia])));
              fullscreenNumber.value = info.tempA[ia].student_id;
              fullscreenName.value = (info.tempA[ia].name || '') + ' [' + info.sideALabel + ']';
              if (noRepeat.value) addToUsed(info.tempA[ia]); info.tempA.splice(ia, 1);
            } else if (!fromA && info.tempB.length > 0) {
              var ib = Math.floor(Math.random() * info.tempB.length);
              pickedB.push(JSON.parse(JSON.stringify(info.tempB[ib])));
              fullscreenNumber.value = info.tempB[ib].student_id;
              fullscreenName.value = (info.tempB[ib].name || '') + ' [' + info.sideBLabel + ']';
              if (noRepeat.value) addToUsed(info.tempB[ib]); info.tempB.splice(ib, 1);
            }
            idx++;
          }, 250);
        };
        
        // 页面切换
        var startDraw = function() {
          isSetupPage.value = false;
          usedList.value = [];
          resetPKDisplay();
          multiDrawResults.value = [];
          currentNumber.value = '—';
          currentStudent.value = { student_id: '', name: '', gender: '' };
        };
        
        var goBack = function() {
          isSetupPage.value = true;
          pkMode.value = false;
          if (isContinuous.value) { clearInterval(continuousTimer.value); isContinuous.value = false; }
          if (tensionTimer.value) { clearInterval(tensionTimer.value); tensionTimer.value = null; }
          if (fullscreenTimer.value) { clearInterval(fullscreenTimer.value); fullscreenTimer.value = null; showFullscreenEffect.value = false; }
        };
        
        var copyShareLink = function() {
          updateUrlParams();
          var url = window.location.href;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function() { showNotification('📋 链接已复制到剪贴板！', 'success'); })
              .catch(function() { fallbackCopy(url); });
          } else { fallbackCopy(url); }
        };
        
        var fallbackCopy = function(url) {
          var ta = document.createElement('textarea');
          ta.value = url; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); document.body.removeChild(ta);
          showNotification('📋 链接已复制到剪贴板！', 'success');
        };
        
        // 模态框
        var showResetHistoryModal = function() {
          modalConfig.value = { title: '重置抽取历史', message: '确定要重置所有抽取记录吗？', danger: true, confirmText: '确认重置', onConfirm: function() { usedList.value = []; multiDrawResults.value = []; pkResults.value = { sideA: [], sideB: [], sideALabel: 'A阵营', sideBLabel: 'B阵营' }; currentNumber.value = '—'; currentStudent.value = { student_id: '', name: '', gender: '' }; showModal.value = false; showNotification('已重置抽取记录', 'info'); }, inputRequired: false };
          showModal.value = true;
        };
        
        var showClearHistoryModal = function() {
          modalConfig.value = { title: '清除已抽取列表', message: '确定要清除已抽取列表吗？', danger: true, confirmText: '确认清除', onConfirm: function() { usedList.value = []; showModal.value = false; showNotification('已清除已抽取列表', 'info'); }, inputRequired: false };
          showModal.value = true;
        };
        
        var showClearGroupModal = function() {
          modalConfig.value = { title: '清空当前分组', message: '确定要清空当前分组的所有学生数据吗？', danger: true, confirmText: '确认清空', onConfirm: function() { var gIdx = studentGroups.value.findIndex(function(g) { return g.name === currentGroup.value; }); if (gIdx >= 0) { studentGroups.value[gIdx].students = []; localStorage.setItem('studentGroups', JSON.stringify(studentGroups.value)); showNotification('已清空当前分组', 'info'); } showModal.value = false; }, inputRequired: false };
          showModal.value = true;
        };
        
        var showDeleteGroupModal = function(name, idx) {
          if (studentGroups.value.length <= 1) { showNotification('至少保留一个分组', 'warning'); return; }
          modalConfig.value = { title: '删除分组', message: '确定要删除分组 "'+name+'" 吗？', danger: true, confirmText: '删除', onConfirm: function() { studentGroups.value.splice(idx, 1); if (currentGroup.value === name) currentGroup.value = studentGroups.value[0].name; localStorage.setItem('studentGroups', JSON.stringify(studentGroups.value)); showNotification('已删除分组 "'+name+'"', 'info'); showModal.value = false; }, inputRequired: false };
          showModal.value = true;
        };
        
        var showRenameGroupModal = function(name, idx) {
          modalConfig.value = { title: '重命名分组', inputRequired: true, inputValue: name, inputPlaceholder: '输入新组名', confirmText: '确认重命名', onConfirm: function() {
            var newName = (modalConfig.value.inputValue || '').trim();
            if (!newName) { showNotification('组名不能为空', 'warning'); return; }
            if (studentGroups.value.some(function(g, i) { return g.name === newName && i !== idx; })) { showNotification('组名已存在', 'error'); return; }
            studentGroups.value[idx].name = newName;
            if (currentGroup.value === name) currentGroup.value = newName;
            localStorage.setItem('studentGroups', JSON.stringify(studentGroups.value));
            showNotification('已重命名为 "'+newName+'"', 'success');
            showModal.value = false;
          }};
          showModal.value = true;
        };
        
        var showAddGroupModal = function() {
          modalConfig.value = { title: '新建分组', inputRequired: true, inputValue: '', inputPlaceholder: '输入组名', confirmText: '创建', onConfirm: function() {
            var name = (modalConfig.value.inputValue || '').trim();
            if (!name) { showNotification('组名不能为空', 'warning'); return; }
            if (studentGroups.value.some(function(g) { return g.name === name; })) { showNotification('组名已存在', 'error'); return; }
            studentGroups.value.push({ name: name, students: [] });
            currentGroup.value = name;
            localStorage.setItem('studentGroups', JSON.stringify(studentGroups.value));
            showNotification('已创建分组 "'+name+'"', 'success');
            showModal.value = false;
          }};
          showModal.value = true;
        };
        
        // Excel多Sheet导入（全量导入，不分对话框）
        var handleFileSelect = function() {
          SNP.selectExcelFile(function(arrayBuffer) {
            if (!arrayBuffer) { showNotification('文件读取失败，请重试', 'error'); return; }
            SNP.parseExcelAllSheets(arrayBuffer, function(allSheets) {
              importSheetsData(allSheets);
            }, function(errMsg) { showNotification(errMsg, 'error'); });
          });
        };
        
        var importSheetsData = function(sheets) {
          var gIdx = studentGroups.value.findIndex(function(g) { return g.name === currentGroup.value; });
          if (gIdx < 0) return;
          var existingKeys = studentGroups.value[gIdx].students.map(function(s) { return s.student_id + '|' + (s.sheet || ''); });
          var added = 0;
          for (var si = 0; si < sheets.length; si++) {
            for (var ssi = 0; ssi < sheets[si].students.length; ssi++) {
              var s = sheets[si].students[ssi];
              var key = s.student_id + '|' + (s.sheet || '');
              if (existingKeys.indexOf(key) === -1) {
                studentGroups.value[gIdx].students.push(JSON.parse(JSON.stringify(s)));
                existingKeys.push(key);
                added++;
              }
            }
          }
          localStorage.setItem('studentGroups', JSON.stringify(studentGroups.value));
          showNotification('成功导入 '+added+' 条新记录', 'success');
        };
        
        var toggleSheetFilter = function(sheetName) {
          if (activeSheets.value[sheetName]) {
            delete activeSheets.value[sheetName];
          } else {
            activeSheets.value[sheetName] = true;
          }
          activeSheets.value = Object.assign({}, activeSheets.value);
        };
        
        var toggleAllSheets = function() {
          var names = Object.keys(availableSheets.value);
          var allOn = names.every(function(n) { return activeSheets.value[n]; });
          var newVal = {};
          if (!allOn) { for (var i = 0; i < names.length; i++) newVal[names[i]] = true; }
          activeSheets.value = newVal;
          sheetFilterEnabled.value = !allOn;
        };

        var handleDragOver = function(e) { e.preventDefault(); isDragOver.value = true; };
        var handleDragLeave = function() { isDragOver.value = false; };
        var handleDrop = function(e) {
          e.preventDefault(); isDragOver.value = false;
          var files = e.dataTransfer.files;
          if (files.length > 0) {
            var file = files[0];
            var reader = new FileReader();
            reader.onload = function(evt) {
              SNP.parseExcelAllSheets(evt.target.result, function(allSheets) {
                importSheetsData(allSheets);
              }, function(errMsg) { showNotification(errMsg, 'error'); });
            };
            reader.readAsArrayBuffer(file);
          }
        };
        
        // 粘贴导入
        var showPasteImportModal = function() { var modal = document.getElementById('pasteModal'); if (modal) { modal.classList.add('show'); var ta = document.getElementById('pasteData'); if (ta) ta.value = ''; } };
        var closePasteModal = function() { var modal = document.getElementById('pasteModal'); if (modal) modal.classList.remove('show'); };
        var confirmPasteImport = function() {
          var textarea = document.getElementById('pasteData');
          var text = textarea ? textarea.value : '';
          if (!text.trim()) { showNotification('请输入数据', 'warning'); return; }
          SNP.importFromPasteText(text, function(students) {
            var gIdx = studentGroups.value.findIndex(function(g) { return g.name === currentGroup.value; });
            if (gIdx >= 0) {
              var existingKeys = studentGroups.value[gIdx].students.map(function(s) { return s.student_id + '|' + (s.sheet || ''); });
              var added = 0;
              for (var si = 0; si < students.length; si++) {
                var key = students[si].student_id + '|' + (students[si].sheet || '');
                if (existingKeys.indexOf(key) === -1) {
                  studentGroups.value[gIdx].students.push(JSON.parse(JSON.stringify(students[si])));
                  existingKeys.push(key);
                  added++;
                }
              }
              localStorage.setItem('studentGroups', JSON.stringify(studentGroups.value));
              showNotification('成功导入 '+added+' 条新记录', 'success');
              closePasteModal();
            }
          }, function(errMsg) { showNotification(errMsg, 'error'); });
        };
        
        if (typeof window !== 'undefined') {
          window.selectExcelFile = handleFileSelect;
          window.showPasteImport = showPasteImportModal;
          window.closePasteModal = closePasteModal;
          window.confirmPasteImport = confirmPasteImport;
        }
        
        var deleteStudent = function(studentId) {
          var gIdx = studentGroups.value.findIndex(function(g) { return g.name === currentGroup.value; });
          if (gIdx >= 0) {
            var sIdx = studentGroups.value[gIdx].students.findIndex(function(s) { return s.student_id === studentId; });
            if (sIdx >= 0) { studentGroups.value[gIdx].students.splice(sIdx, 1); localStorage.setItem('studentGroups', JSON.stringify(studentGroups.value)); showNotification('已删除学生', 'info'); }
          }
        };
        
        // 持久化
        onMounted(function() {
          var savedDM = localStorage.getItem('darkMode');
          if (savedDM === 'true') { darkMode.value = true; document.body.classList.add('dark-mode'); }
          var savedGroups = localStorage.getItem('studentGroups');
          if (savedGroups) {
            try { var parsed = JSON.parse(savedGroups); if (Array.isArray(parsed) && parsed.length > 0) studentGroups.value = parsed; } catch (e) {}
          }
          var savedProb = localStorage.getItem('probabilityRanges');
          if (savedProb) { try { probabilityRanges.value = JSON.parse(savedProb); } catch (e) {} }
          loadFromUrlParams();
          updateUrlParams();
          // 绑定粘贴模态框按钮事件
          var closeBtn = document.getElementById('closePasteBtn');
          if (closeBtn) closeBtn.addEventListener('click', closePasteModal);
          var confirmBtn = document.getElementById('confirmPasteBtn');
          if (confirmBtn) confirmBtn.addEventListener('click', confirmPasteImport);
        });
        
        watch(darkMode, function(val) { document.body.classList.toggle('dark-mode', val); localStorage.setItem('darkMode', val); });
        watch([operationMode, drawMode, noRepeat, darkMode, startNumber, endNumber, nameFontSize, numberFontSize, multiDrawCount, batchDrawCount, tensionFlashCount, tensionFlashSpeed, probabilityRanges], function() { if (isSetupPage.value) updateUrlParams(); }, { deep: true });
        watch(probabilityRanges, function(val) { localStorage.setItem('probabilityRanges', JSON.stringify(val)); updateUrlParams(); }, { deep: true });
        watch(studentGroups, function(val) { localStorage.setItem('studentGroups', JSON.stringify(val)); }, { deep: true });
        watch([genderFilter, pkMode, pkCountPerSide, toleranceEnabled, toleranceMin, toleranceMax], function() { if (isSetupPage.value) updateUrlParams(); });
        
        // 构建上下文对象传给render
        var ctx = {
          isSetupPage: isSetupPage, darkMode: darkMode, showAdvanced: showAdvanced,
          showBatchPanel: showBatchPanel, showDrawSettings: showDrawSettings, showModal: showModal,
          showFullscreenEffect: showFullscreenEffect, showCelebration: showCelebration,
          isContinuous: isContinuous, animationClass: animationClass, isDragOver: isDragOver,
          modalConfig: modalConfig, notifications: notifications,
          operationMode: operationMode, startNumber: startNumber, endNumber: endNumber,
          drawMode: drawMode, noRepeat: noRepeat, nameFontSize: nameFontSize,
          numberFontSize: numberFontSize, multiDrawCount: multiDrawCount,
          batchDrawCount: batchDrawCount, tensionFlashCount: tensionFlashCount,
          tensionFlashSpeed: tensionFlashSpeed, probabilityRanges: probabilityRanges,
          studentGroups: studentGroups, currentGroup: currentGroup,
          currentNumber: currentNumber, currentStudent: currentStudent,
          usedList: usedList, multiDrawResults: multiDrawResults,
          fullscreenNumber: fullscreenNumber, fullscreenName: fullscreenName,
          fullscreenResults: fullscreenResults, celebrationMessage: celebrationMessage,
          genderFilter: genderFilter, pkMode: pkMode, pkCountPerSide: pkCountPerSide,
          pkResults: pkResults, toleranceEnabled: toleranceEnabled, toleranceMin: toleranceMin, toleranceMax: toleranceMax,
          availableSheets: availableSheets, activeSheets: activeSheets, sheetFilterEnabled: sheetFilterEnabled, sheetViewTag: sheetViewTag,
          currentStudents: currentStudents, totalCount: totalCount, availableCount: availableCount,
          hasGenderData: hasGenderData, maleCount: maleCount, femaleCount: femaleCount,
          getDrawModeValue: getDrawModeValue, setDrawModeValue: setDrawModeValue,
          drawSingle: drawSingle, toggleContinuous: toggleContinuous, startTension: startTension,
          drawMultiWithAnimation: drawMultiWithAnimation, drawBatchWithAnimation: drawBatchWithAnimation,
          startDraw: startDraw, goBack: goBack, copyShareLink: copyShareLink,
          showResetHistoryModal: showResetHistoryModal, showClearHistoryModal: showClearHistoryModal,
          showClearGroupModal: showClearGroupModal, showDeleteGroupModal: showDeleteGroupModal,
          showRenameGroupModal: showRenameGroupModal, showAddGroupModal: showAddGroupModal,
          handleFileSelect: handleFileSelect, handleDragOver: handleDragOver,
          handleDragLeave: handleDragLeave, handleDrop: handleDrop,
          showPasteImportModal: showPasteImportModal, deleteStudent: deleteStudent,
          toggleSheetFilter: toggleSheetFilter, toggleAllSheets: toggleAllSheets,
          isMobile: isMobile, fullscreenTimer: fullscreenTimer, celebrationTimer: celebrationTimer
        };
        
        return SNP.createRenderFn(ctx);
      }
    };
    
    createApp(App).mount('#app');
  };
})();