const { createApp, ref, computed, onMounted, watch, nextTick } = Vue;

    createApp({
      setup() {
        // 解析URL参数
        const parseUrlParams = () => {
          const params = new URLSearchParams(window.location.search);
          return {
            start: params.has('start') ? parseInt(params.get('start')) : 1,
            end: params.has('end') ? parseInt(params.get('end')) : 40,
            mode: params.get('mode') || 'd',
            noRepeat: params.has('noRepeat') ? params.get('noRepeat') === 'true' : true,
            operationMode: params.get('operationMode') || 'range',
            globalFont: params.get('globalFont') || 'Inter',
            numberFont: params.get('numberFont') || 'Arial',
            nameSize: params.has('nameSize') ? parseFloat(params.get('nameSize')) : 5,
            numberSize: params.has('numberSize') ? parseInt(params.get('numberSize')) : 80,
            multiDrawCount: params.has('multiDrawCount') ? parseInt(params.get('multiDrawCount')) : 5,
            batchSize: params.has('batchSize') ? parseInt(params.get('batchSize')) : 1
          };
        };

        const urlParams = parseUrlParams();
        
        // 操作模式
        const operationMode = ref(urlParams.operationMode);
        
        // 基本设置
        const start = ref(urlParams.start);
        const end = ref(urlParams.end);
        const mode = ref(urlParams.mode);
        const noRepeat = ref(urlParams.noRepeat);
        const currentNumber = ref('—');
        const currentStudent = ref({ student_id: '', name: '' });
        const isSetupPage = ref(true);
        const usedNumbers = ref([]);
        const isContinuous = ref(false);
        const animationFrameId = ref(null);
        const showCelebration = ref(false);
        const celebrationMessage = ref('所有学号已抽取完成！');
        const showAdvanced = ref(false);
        const probabilityRanges = ref([]);
        const darkMode = ref(false);
        
        // 多抽相关
        const multiDrawCount = ref(urlParams.multiDrawCount);
        const batchSize = ref(urlParams.batchSize);
        const showBatchSettings = ref(false);
        const showMultiEffect = ref(false);
        const multiEffectNumber = ref(0);
        const multiEffectName = ref('');
        const multiDrawResults = ref([]);
        
        // 字体设置
        const selectedGlobalFont = ref(urlParams.globalFont);
        const selectedNumberFont = ref(urlParams.numberFont);
        const nameSize = ref(urlParams.nameSize);
        const numberSize = ref(urlParams.numberSize);
        
        // 名单管理
        const studentGroups = ref([]);
        const currentGroup = ref('默认组');
        
        // 通知提示
        const notification = ref({
          show: false,
          message: '',
          type: '',
          icon: ''
        });

        // 当前学生列表
        const currentStudents = computed(() => {
          const group = studentGroups.value.find(g => g.name === currentGroup.value);
          return group ? group.students : [];
        });

        // 更新URL参数
        const updateUrlParams = () => {
          const params = new URLSearchParams();
          params.set('start', start.value);
          params.set('end', end.value);
          params.set('mode', mode.value);
          params.set('noRepeat', noRepeat.value);
          params.set('operationMode', operationMode.value);
          params.set('globalFont', selectedGlobalFont.value);
          params.set('numberFont', selectedNumberFont.value);
          params.set('nameSize', nameSize.value);
          params.set('numberSize', numberSize.value);
          params.set('multiDrawCount', multiDrawCount.value);
          params.set('batchSize', batchSize.value);
          
          const newUrl = window.location.pathname + '?' + params.toString();
          window.history.replaceState(null , '', newUrl);
        };

        // 显示通知
        const showNotification = (message, type = 'success') => {
          notification.value.message = message;
          notification.value.type = type;
          notification.value.icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
          notification.value.show = true;
          
          setTimeout(() => {
            notification.value.show = false;
          }, 3000);
        };

        // 切换暗黑模式
        const toggleDarkMode = () => {
          darkMode.value = !darkMode.value;
          document.body.classList.toggle('dark-mode', darkMode.value);
          localStorage.setItem('darkMode', darkMode.value);
        };

        // 获取总人数
        const getTotalNumbers = () => {
          if (operationMode.value === 'list') {
            return currentStudents.value.length;
          } else {
            return end.value - start.value + 1;
          }
        };

        // 获取所有可选学号
        const getAllNumbers = () => {
          if (operationMode.value === 'list') {
            return [...currentStudents.value];
          } else {
            const numbers = [];
            for (let i = start.value; i <= end.value; i++) {
              numbers.push({ student_id: i, name: '' });
            }
            return numbers;
          }
        };

        // 生成随机颜色
        const getRandomColor = () => {
          const colors = ['#4361ee', '#4cc9f0', '#f72585', '#f8961e', '#7209b7', '#3a86ff'];
          return colors[Math.floor(Math.random() * colors.length)];
        };

        // 权重随机抽取
        const getWeightedRandomNumber = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          
          if (available.length === 0) return null;
          
          if (probabilityRanges.value.length === 0 || operationMode.value === 'list') {
            const index = Math.floor(Math.random() * available.length);
            return available[index];
          }
          
          let pool = [];
          let totalWeight = 0;
          
          probabilityRanges.value.forEach(range => {
            const nums = getAllNumbers()
              .filter(n => n.student_id >= range.start && n.student_id <= range.end)
              .filter(n => !usedNumbers.value.some(u => u.student_id === n.student_id));
            
            nums.forEach(n => {
              pool.push({ num: n, weight: range.weight });
              totalWeight += range.weight;
            });
          });
          
          if (pool.length === 0) return null;
          
          let random = Math.random() * totalWeight;
          
          for (const item of pool) {
            if (random < item.weight) return item.num;
            random -= item.weight;
          }
          
          return pool[0].num;
        };

        // 抽取学号
        const drawNumber = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          
          if (available.length === 0) {
            triggerCelebration();
            return;
          }
          
          const result = getWeightedRandomNumber();
          
          if (result !== null) {
            if (noRepeat.value) {
              usedNumbers.value.push(result);
            }
            
            currentNumber.value = result.student_id;
            currentStudent.value = result;
            multiDrawResults.value = [result];
            
            if (usedNumbers.value.length === getTotalNumbers()) {
              triggerCelebration();
            }
          } else {
            triggerCelebration();
          }
        };

        // 快速抽取模式
        const toggleContinuous = () => {
          if (isContinuous.value) {
            cancelAnimationFrame(animationFrameId.value);
            isContinuous.value = false;
            
            if (noRepeat.value && currentNumber.value !== '—') {
              const exists = usedNumbers.value.some(
                item => item.student_id === currentNumber.value
              );
              
              if (!exists) {
                usedNumbers.value.push(currentStudent.value);
                
                if (usedNumbers.value.length === getTotalNumbers()) {
                  triggerCelebration();
                }
              }
            }
          } else {
            isContinuous.value = true;
            const animate = () => {
              const available = getAllNumbers().filter(item => 
                !usedNumbers.value.some(used => used.student_id === item.student_id)
              );
              
              if (available.length === 0) {
                cancelAnimationFrame(animationFrameId.value);
                isContinuous.value = false;
                triggerCelebration();
                return;
              }
              
              const result = getWeightedRandomNumber();
              currentNumber.value = result.student_id;
              currentStudent.value = result;
              multiDrawResults.value = [result];
              
              animationFrameId.value = requestAnimationFrame(animate);
            };
            
            animate();
          }
        };

        // 多抽效果
        const multiDraw = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          const drawCount = Math.min(multiDrawCount.value, available.length);
          
          if (drawCount === 0) {
            showNotification('没有可抽取的学号了！', 'error');
            return;
          }
          
          multiDrawResults.value = [];
          showMultiEffect.value = true;
          
          let count = 0;
          const interval = setInterval(() => {
            if (count >= drawCount) {
              clearInterval(interval);
              setTimeout(() => {
                showMultiEffect.value = false;
                
                if (multiDrawResults.value.length > 0) {
                  if (multiDrawResults.value.length === 1) {
                    currentNumber.value = multiDrawResults.value[0].student_id;
                    if (operationMode.value === 'list') {
                      currentStudent.value = multiDrawResults.value[0];
                    }
                  } else {
                    currentNumber.value = multiDrawResults.value.map(r => r.student_id).join(', ');
                    if (operationMode.value === 'list') {
                      currentStudent.value = multiDrawResults.value[multiDrawResults.value.length - 1];
                    }
                  }
                  
                  if (noRepeat.value) {
                    usedNumbers.value.push(...multiDrawResults.value);
                  }
                  
                  if (usedNumbers.value.length === getTotalNumbers()) {
                    triggerCelebration();
                  }
                }
              }, 1000);
              return;
            }
            
            const result = getWeightedRandomNumber();
            if (result) {
              multiDrawResults.value.push(result);
              multiEffectNumber.value = result.student_id;
              multiEffectName.value = result.name || '';
              count++;
            }
          }, 300);
        };

        // 批量抽取
        const drawBatchNumbers = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          const actualSize = Math.min(batchSize.value, available.length);
          
          if (actualSize === 0) {
            showNotification('没有可抽取的学号了！', 'error');
            return;
          }

          const batch = [];
          for (let i = 0; i < actualSize; i++) {
            const result = getWeightedRandomNumber();
            if (result) {
              batch.push(result);
              if (noRepeat.value) {
                usedNumbers.value.push(result);
              }
            }
          }
          
          if (batch.length > 0) {
            multiDrawResults.value = batch;
            
            if (batch.length === 1) {
              currentNumber.value = batch[0].student_id;
              if (operationMode.value === 'list') {
                currentStudent.value = batch[0];
              }
            } else {
              currentNumber.value = batch.map(r => r.student_id).join(', ');
              if (operationMode.value === 'list') {
                currentStudent.value = batch[batch.length - 1];
              }
            }
            
            if (batch.length > 3) {
              triggerCelebration(`成功抽取${batch.length}人！`, batch.length * 100);
            } else if (usedNumbers.value.length === getTotalNumbers()) {
              triggerCelebration();
            }
          }
        };

        // 触发庆祝动画
        const triggerCelebration = (message = '所有学号已抽取完成！', duration = 3000) => {
          celebrationMessage.value = message;
          showCelebration.value = true;
          
          setTimeout(() => {
            showCelebration.value = false;
          }, duration);
        };

        // 验证并进入抽取页面
        const validateAndNavigate = () => {
          if (operationMode.value === 'range') {
            if (start.value > end.value) {
              showNotification('错误：起始学号不能大于结束学号', 'error');
              return;
            }
            if (start.value < 1 || end.value < 1) {
              showNotification('错误：学号不能小于1', 'error');
              return;
            }
            
            probabilityRanges.value.forEach(range => {
              if (range.start > range.end) {
                showNotification(`错误：范围 ${range.start}-${range.end} 起始值不能大于结束值`, 'error');
                return;
              }
              if (range.start < start.value || range.end > end.value) {
                showNotification(`错误：范围 ${range.start}-${range.end} 超出学号范围`, 'error');
                return;
              }
              if (range.weight <= 0) {
                showNotification(`错误：范围 ${range.start}-${range.end} 权重必须大于0`, 'error');
                return;
              }
            });
          } else if (operationMode.value === 'list') {
            if (currentStudents.value.length === 0) {
              showNotification('错误：当前组没有学生', 'error');
              return;
            }
          }
          
          isSetupPage.value = false;
          usedNumbers.value = [];
          currentNumber.value = '—';
          currentStudent.value = { student_id: '', name: '' };
          multiDrawResults.value = [];
          updateUrlParams();
        };

        // 返回设置页面
        const goBack = () => {
          if (isContinuous.value) {
            cancelAnimationFrame(animationFrameId.value);
            isContinuous.value = false;
          }
          isSetupPage.value = true;
          updateUrlParams();
        };

        // 重置抽取记录
        const resetUsedNumbers = () => {
          if (confirm('确定要重置已抽取记录吗？')) {
            usedNumbers.value = [];
            currentNumber.value = '—';
            currentStudent.value = { student_id: '', name: '' };
            multiDrawResults.value = [];
            showNotification('已重置抽取记录');
          }
        };

        // 清除历史记录
        const clearHistory = () => {
          usedNumbers.value = [];
          currentNumber.value = '—';
          currentStudent.value = { student_id: '', name: '' };
          multiDrawResults.value = [];
        };

        // 文件上传处理
        const selectFile = () => {
          document.getElementById('fileInput').click();
        };

        const handleFileUpload = (event) => {
          const file = event.target.files[0];
          if (!file) return;
          
          const reader = new FileReader();
          
          reader.onload = function(e) {
            try {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: 'array' });
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              
              const newStudents = [];
              for (let i = 0; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || row.length === 0) continue;
                
                const studentId = String(row[0]).trim();
                const name = row.length > 1 ? String(row[1]).trim() : '';
                
                if (studentId) {
                  newStudents.push({ student_id: studentId, name });
                }
              }
              
              if (newStudents.length === 0) {
                showNotification('未找到有效的学生数据', 'error');
                return;
              }
              
              const groupIndex = studentGroups.value.findIndex(g => g.name === currentGroup.value);
              if (groupIndex >= 0) {
                const existingIds = studentGroups.value[groupIndex].students.map(s => s.student_id);
                newStudents.forEach(student => {
                  if (!existingIds.includes(student.student_id)) {
                    studentGroups.value[groupIndex].students.push(student);
                  }
                });
                saveGroups();
                showNotification(`成功导入 ${newStudents.length} 条学生记录`);
              }
              
              event.target.value = '';
            } catch (error) {
              showNotification(`解析Excel文件失败: ${error.message}`, 'error');
            }
          };
          
          reader.readAsArrayBuffer(file);
        };

        // 名单组管理
        const switchGroup = (groupName) => {
          currentGroup.value = groupName;
        };

        const addNewGroup = () => {
          const name = prompt('请输入新组名称：');
          if (name && name.trim()) {
            if (!studentGroups.value.some(g => g.name === name)) {
              studentGroups.value.push({ name, students: [] });
              currentGroup.value = name;
              saveGroups();
            } else {
              showNotification('组名已存在', 'error');
            }
          }
        };

        const deleteStudent = (index) => {
          const groupIndex = studentGroups.value.findIndex(g => g.name === currentGroup.value);
          if (groupIndex >= 0) {
            studentGroups.value[groupIndex].students.splice(index, 1);
            saveGroups();
            showNotification('学生已删除');
          }
        };

        const clearCurrentGroup = () => {
          if (confirm(`确定要清空"${currentGroup.value}"组的所有学生吗？`)) {
            const groupIndex = studentGroups.value.findIndex(g => g.name === currentGroup.value);
            if (groupIndex >= 0) {
              studentGroups.value[groupIndex].students = [];
              saveGroups();
              showNotification('已清空学生名单');
            }
          }
        };

        const saveGroups = () => {
          localStorage.setItem('studentGroups', JSON.stringify(studentGroups.value));
        };

        // 添加概率范围
        const addRange = () => {
          probabilityRanges.value.push({ 
            start: start.value, 
            end: end.value, 
            weight: 50 
          });
        };

        const removeRange = (index) => {
          probabilityRanges.value.splice(index, 1);
        };

        // 应用字体设置
        const applyFontSettings = () => {
          document.documentElement.style.setProperty('--global-font', selectedGlobalFont.value);
          document.documentElement.style.setProperty('--number-font', selectedNumberFont.value);
          document.documentElement.style.setProperty('--name-size', nameSize.value + 'rem');
          document.documentElement.style.setProperty('--number-size', numberSize.value + 'pt');
          showNotification('字体设置已应用');
          updateUrlParams();
        };

        // 调整概率范围
        const adjustProbabilityRanges = () => {
          probabilityRanges.value.forEach(range => {
            if (range.start < start.value) range.start = start.value;
            if (range.end > end.value) range.end = end.value;
            if (range.start > range.end) range.start = range.end;
          });
        };

        onMounted(() => {
          try {
            // 加载名单组
            const savedGroups = localStorage.getItem('studentGroups');
            if (savedGroups) {
              studentGroups.value = JSON.parse(savedGroups);
            }
            if (studentGroups.value.length === 0) {
              studentGroups.value = [{ name: '默认组', students: [] }];
            }

            // 加载暗黑模式
            const savedDarkMode = localStorage.getItem('darkMode');
            if (savedDarkMode !== null) {
              darkMode.value = savedDarkMode === 'true';
              document.body.classList.toggle('dark-mode', darkMode.value);
            }
          } catch (e) {
            console.error('Failed to load data from localStorage', e);
          }
          
          if (probabilityRanges.value.length === 0) {
            addRange();
          }
          
          applyFontSettings();
        });
        
        // 监听参数变化更新URL
        watch([start, end, mode, noRepeat, operationMode, selectedGlobalFont, 
              selectedNumberFont, nameSize, numberSize, multiDrawCount, batchSize], 
        updateUrlParams, { deep: true });
        
        // 监听起始和结束学号变化调整概率范围
        watch([start, end], adjustProbabilityRanges);

        return {
          operationMode,
          start,
          end,
          mode,
          noRepeat,
          currentNumber,
          currentStudent,
          isSetupPage,
          usedNumbers,
          isContinuous,
          showCelebration,
          celebrationMessage,
          showAdvanced,
          probabilityRanges,
          darkMode,
          selectedGlobalFont,
          selectedNumberFont,
          nameSize,
          numberSize,
          multiDrawCount,
          batchSize,
          showBatchSettings,
          showMultiEffect,
          multiEffectNumber,
          multiEffectName,
          multiDrawResults,
          studentGroups,
          currentGroup,
          currentStudents,
          notification,
          showNotification,
          toggleDarkMode,
          getTotalNumbers,
          drawNumber,
          toggleContinuous,
          triggerCelebration,
          validateAndNavigate,
          goBack,
          resetUsedNumbers,
          clearHistory,
          selectFile,
          handleFileUpload,
          switchGroup,
          addNewGroup,
          deleteStudent,
          clearCurrentGroup,
          saveGroups,
          addRange,
          removeRange,
          applyFontSettings,
          getRandomColor,
          multiDraw,
          drawBatchNumbers,
          adjustProbabilityRanges,
          updateUrlParams
        };
      }
    }).mount('#app');