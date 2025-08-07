
    const { createApp, ref, computed, onMounted, watch } = Vue;
    createApp({
      setup() {
        // --- 状态变量 ---
        const isDragOver = ref(false); // 拖拽状态
        const isSetupPage = ref(true); // 当前是否为设置页面
        const darkMode = ref(false); // 深色模式状态
        const showAdvanced = ref(false); // 高级设置面板是否展开
        const showBatchSettings = ref(false); // 批量抽取设置面板是否显示
        const showMultiEffect = ref(false); // 全屏抽取效果是否显示
        const showCelebration = ref(false); // 庆祝动画是否显示
        const isContinuous = ref(false); // 快速抽取模式是否正在运行
        const continuousIntervalId = ref(null); // 快速抽取的定时器ID
        const currentAnimationClass = ref(''); // 当前应用的动画类名
        // --- 模态框状态 ---
        const showModal = ref(false);
        const modalConfig = ref({
          title: '',
          message: '',
          confirmText: '确定',
          danger: false,
          onConfirm: () => {},
          // 新增：用于动态输入
          inputRequired: false,
          inputValue: '',
          inputPlaceholder: ''
        });
        // 用于在模态框打开后自动聚焦输入框
        const modalInputRef = ref(null);
        // --- 核心数据 ---
        const operationMode = ref('range'); // 操作模式: 'range' | 'list'
        const start = ref(1); // 起始学号
        const end = ref(40); // 结束学号
        const mode = ref('d'); // 抽取模式: 'd' (单次) | 's' (快速)
        const noRepeat = ref(true); // 是否不重复抽取
        const currentNumber = ref('—'); // 当前显示的学号
        const currentStudent = ref({ student_id: '', name: '' }); // 当前显示的学生
        const usedNumbers = ref([]); // 已抽取的学号历史记录
        const multiDrawResults = ref([]); // 连抽/批量抽取的中间结果
        const studentGroups = ref([]); // 存储所有学生分组
        const currentGroup = ref('默认组'); // 当前选中的分组名
        const probabilityRanges = ref([]); // 概率权重范围数组
        const celebrationMessage = ref('所有学号已抽取完成！'); // 庆祝消息
        const notification = ref({ // 通知消息对象
          show: false,
          message: '',
          type: '',
          icon: ''
        });
        const multiEffectNumber = ref(0); // 全屏效果中显示的学号
        const multiEffectName = ref(''); // 全屏效果中显示的姓名
        // --- 用户界面设置 ---
        const nameSize = ref(5); // 姓名字号 (rem)
        const numberSize = ref(80); // 学号大小 (pt)
        const multiDrawCount = ref(5); // 连抽次数
        const batchSize = ref(1); // 批量抽取人数
        // --- 计算属性 ---
        // 计算当前分组的学生列表
        const currentStudents = computed(() => {
          const group = studentGroups.value.find(g => g.name === currentGroup.value);
          return group ? group.students : [];
        });
        // 计算总共有多少个可抽取的学号
        const getTotalNumbers = () => {
          if (operationMode.value === 'list') {
            return currentStudents.value.length;
          } else {
            return end.value - start.value + 1;
          }
        };
        // 获取所有可用的学号（包括学号和姓名）
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
        // --- URL参数处理 ---
        // 将概率权重数组编码为URL安全的字符串
        const encodeProbabilityRanges = (ranges) => {
          return ranges.map(r => `${r.start}-${r.end}-${r.weight}`).join(';');
        };
        // 将URL中的字符串解码为概率权重数组
        const decodeProbabilityRanges = (str) => {
          if (!str) return [];
          return str.split(';').map(part => {
            const [start, end, weight] = part.split('-').map(Number);
            return { start, end, weight };
          }).filter(r => !isNaN(r.start) && !isNaN(r.end) && !isNaN(r.weight));
        };
        // 从URL参数中解析初始设置
        const parseUrlParams = () => {
          const params = new URLSearchParams(window.location.search);
          return {
            start: params.has('start') ? parseInt(params.get('start')) : 1,
            end: params.has('end') ? parseInt(params.get('end')) : 40,
            mode: params.get('mode') || 'd',
            noRepeat: params.has('noRepeat') ? params.get('noRepeat') === 'true' : true,
            operationMode: params.get('operationMode') || 'range',
            nameSize: params.has('nameSize') ? parseFloat(params.get('nameSize')) : 5,
            numberSize: params.has('numberSize') ? parseInt(params.get('numberSize')) : 80,
            multiDrawCount: params.has('multiDrawCount') ? parseInt(params.get('multiDrawCount')) : 5,
            batchSize: params.has('batchSize') ? parseInt(params.get('batchSize')) : 1,
            probabilityRanges: decodeProbabilityRanges(params.get('probabilityRanges'))
          };
        };
        // 将当前设置同步到URL参数
        const updateUrlParams = () => {
          const params = new URLSearchParams();
          params.set('start', start.value);
          params.set('end', end.value);
          params.set('mode', mode.value);
          params.set('noRepeat', noRepeat.value);
          params.set('operationMode', operationMode.value);
          params.set('nameSize', nameSize.value);
          params.set('numberSize', numberSize.value);
          params.set('multiDrawCount', multiDrawCount.value);
          params.set('batchSize', batchSize.value);
          if (probabilityRanges.value.length > 0) {
            params.set('probabilityRanges', encodeProbabilityRanges(probabilityRanges.value));
          }
          const newUrl = window.location.pathname + '?' + params.toString();
          window.history.replaceState(null, '', newUrl);
        };
        // --- 通知系统 ---
        const showNotification = (message, type = 'success') => {
          notification.value.message = message;
          notification.value.type = type;
          notification.value.icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
          notification.value.show = true;
          setTimeout(() => {
            notification.value.show = false;
          }, 3000);
        };
        // --- 主题切换 ---
        const toggleDarkMode = () => {
          darkMode.value = !darkMode.value;
          document.body.classList.toggle('dark-mode', darkMode.value);
          localStorage.setItem('darkMode', darkMode.value);
        };
        // --- 文件上传处理 ---
        const handleDragEnter = () => {
          isDragOver.value = true;
        };
        const handleDragOver = () => {
          isDragOver.value = true;
        };
        const handleDragLeave = () => {
          isDragOver.value = false;
        };
        const handleDrop = (e) => {
          isDragOver.value = false;
          const files = e.dataTransfer.files;
          if (files.length > 0) {
            const file = files[0];
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
              handleFileData(file);
            } else {
              showNotification('请上传Excel文件(.xlsx或.xls)', 'error');
            }
          }
        };
        // --- 随机数与概率 ---
        const getRandomColor = () => {
          const colors = ['#4361ee', '#4cc9f0', '#f72585', '#f8961e', '#7209b7', '#3a86ff'];
          return colors[Math.floor(Math.random() * colors.length)];
        };
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
        // --- 抽取动画 ---
        const applyAnimation = (animationClass, callback) => {
          currentAnimationClass.value = animationClass;
          if (callback) callback();
          setTimeout(() => {
            currentAnimationClass.value = '';
          }, 500);
        };
        // --- 单次抽取 ---
        const drawNumberWithAnimation = () => {
          multiDrawResults.value = [];
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          if (available.length === 0) {
            triggerCelebration();
            return;
          }
          const animations = ['flip', 'popIn'];
          const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
          applyAnimation(randomAnimation, drawNumber);
        };
        const drawNumber = () => {
          const result = getWeightedRandomNumber();
          if (result !== null) {
            if (noRepeat.value) {
              const exists = usedNumbers.value.some(
                item => item.student_id === result.student_id
              );
              if (!exists) {
                usedNumbers.value.push(result);
              }
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
        // --- 快速抽取 ---
        const toggleContinuous = () => {
          if (isContinuous.value) {
            clearInterval(continuousIntervalId.value);
            isContinuous.value = false;
            drawNumber(); // 停止时执行单次抽取逻辑
          } else {
            isContinuous.value = true;
            continuousIntervalId.value = setInterval(() => {
              const available = getAllNumbers().filter(item => 
                !usedNumbers.value.some(used => used.student_id === item.student_id)
              );
              if (available.length === 0) {
                clearInterval(continuousIntervalId.value);
                isContinuous.value = false;
                triggerCelebration();
                return;
              }
              const result = getWeightedRandomNumber();
              if (result) {
                currentNumber.value = result.student_id;
                currentStudent.value = result;
                multiDrawResults.value = [result];
              }
            }, 30);
          }
        };
        // --- 连抽 ---
        const multiDrawWithAnimation = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          const drawCount = Math.min(multiDrawCount.value, available.length);
          if (drawCount === 0) {
            showNotification('没有可抽取的学号了！', 'error');
            return;
          }
          applyAnimation('rollIn', multiDraw);
        };
        const multiDraw = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          const drawCount = Math.min(multiDrawCount.value, available.length);
          if (drawCount === 0) return;
          multiDrawResults.value = [];
          showMultiEffect.value = true;
          let count = 0;
          const interval = setInterval(() => {
            if (count >= drawCount) {
              clearInterval(interval);
              setTimeout(() => {
                showMultiEffect.value = false;
                if (multiDrawResults.value.length > 0) {
                  const lastResult = multiDrawResults.value[multiDrawResults.value.length - 1];
                  currentNumber.value = lastResult.student_id;
                  currentStudent.value = lastResult;
                  if (noRepeat.value) {
                    multiDrawResults.value.forEach(result => {
                      const exists = usedNumbers.value.some(
                        item => item.student_id === result.student_id
                      );
                      if (!exists) {
                        usedNumbers.value.push(result);
                      }
                    });
                  }
                  if (usedNumbers.value.length === getTotalNumbers()) {
                    triggerCelebration();
                  }
                }
              }, 1000);
              return;
            }
            let result;
            let attempts = 0;
            do {
              result = getWeightedRandomNumber();
              attempts++;
              if (!result || attempts > 100) break;
            } while (result && multiDrawResults.value.some(item => item.student_id === result.student_id));
            if (result) {
              multiDrawResults.value.push(result);
              multiEffectNumber.value = result.student_id;
              multiEffectName.value = result.name || '';
              count++;
            }
          }, 300);
        };
        // --- 批量抽取 ---
        const drawBatchNumbersWithAnimation = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          const actualSize = Math.min(batchSize.value, available.length);
          if (actualSize === 0) {
            showNotification('没有可抽取的学号了！', 'error');
            return;
          }
          applyAnimation('rollIn', drawBatchNumbers);
        };
        const drawBatchNumbers = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          const actualSize = Math.min(batchSize.value, available.length);
          if (actualSize === 0) return;
          const batch = [];
          for (let i = 0; i < actualSize; i++) {
            const result = getWeightedRandomNumber();
            if (result) {
              if (!batch.some(item => item.student_id === result.student_id)) {
                batch.push(result);
                if (noRepeat.value) {
                  const exists = usedNumbers.value.some(
                    item => item.student_id === result.student_id
                  );
                  if (!exists) {
                    usedNumbers.value.push(result);
                  }
                }
              }
            }
          }
          if (batch.length > 0) {
            multiDrawResults.value = batch;
            const lastResult = batch[batch.length - 1];
            currentNumber.value = lastResult.student_id;
            currentStudent.value = lastResult;
            if (batch.length > 3) {
              triggerCelebration(`成功抽取${batch.length}人！`, batch.length * 100);
            } else if (usedNumbers.value.length === getTotalNumbers()) {
              triggerCelebration();
            }
          }
        };
        // --- 庆祝动画 ---
        const triggerCelebration = (message = '所有学号已抽取完成！', duration = 3000) => {
          celebrationMessage.value = message;
          showCelebration.value = true;
          setTimeout(() => {
            showCelebration.value = false;
          }, duration);
        };
        // --- 文件处理 ---
        const handleFileData = (file) => {
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
            } catch (error) {
              showNotification(`解析Excel文件失败: ${error.message}`, 'error');
            }
          };
          reader.readAsArrayBuffer(file);
        };
        // --- 页面导航与验证 ---
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
        const goBack = () => {
          if (isContinuous.value) {
            clearInterval(continuousIntervalId.value);
            isContinuous.value = false;
          }
          isSetupPage.value = true;
          updateUrlParams();
        };
        // --- 历史记录管理 ---
        const clearHistory = () => {
          usedNumbers.value = [];
          currentNumber.value = '—';
          currentStudent.value = { student_id: '', name: '' };
          multiDrawResults.value = [];
        };
        const resetUsedNumbers = () => {
          clearHistory();
          showNotification('已重置抽取记录');
        };
        // --- 文件上传辅助函数 ---
        const selectFile = () => {
          document.getElementById('fileInput').click();
        };
        const handleFileUpload = (event) => {
          const file = event.target.files[0];
          if (!file) return;
          handleFileData(file);
          event.target.value = '';
        };
        // --- 学生分组管理 ---
        const switchGroup = (groupName) => {
          currentGroup.value = groupName;
        };
        const addNewGroup = () => {
          const name = modalConfig.value.inputValue.trim();
          if (!name) {
            showNotification('组名不能为空', 'error');
            return;
          }
          if (!studentGroups.value.some(g => g.name === name)) {
            studentGroups.value.push({ name, students: [] });
            currentGroup.value = name;
            saveGroups();
            showNotification(`已创建新组: ${name}`);
            closeModal();
          } else {
            showNotification('组名已存在', 'error');
          }
        };
        const renameGroup = (oldName, index) => {
          const newName = modalConfig.value.inputValue.trim();
          if (!newName) {
            showNotification('组名不能为空', 'error');
            return;
          }
          if (studentGroups.value.some((g, i) => g.name === newName && i !== index)) {
            showNotification('组名已存在', 'error');
            return;
          }
          studentGroups.value[index].name = newName;
          if (currentGroup.value === oldName) {
            currentGroup.value = newName;
          }
          saveGroups();
          showNotification(`已将组 "${oldName}" 重命名为 "${newName}"`);
          closeModal();
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
          const groupIndex = studentGroups.value.findIndex(g => g.name === currentGroup.value);
          if (groupIndex >= 0) {
            studentGroups.value[groupIndex].students = [];
            saveGroups();
            showNotification('已清空学生名单');
          }
        };
        const deleteGroup = (groupName, index) => {
          if (studentGroups.value.length <= 1) {
            showNotification('至少需要保留一个分组', 'error');
            return;
          }
          const otherIndex = index === 0 ? 1 : 0;
          const newCurrentGroup = studentGroups.value[otherIndex].name;
          studentGroups.value.splice(index, 1);
          if (currentGroup.value === groupName) {
            currentGroup.value = newCurrentGroup;
          }
          saveGroups();
          showNotification(`已删除组: ${groupName}`);
        };
        // --- 数据持久化 ---
        const saveGroups = () => {
          localStorage.setItem('studentGroups', JSON.stringify(studentGroups.value));
        };
        // --- 字号设置 ---
        const applyFontSettings = () => {
          document.documentElement.style.setProperty('--name-size', nameSize.value + 'rem');
          document.documentElement.style.setProperty('--number-size', numberSize.value + 'pt');
          showNotification('字号设置已应用');
          updateUrlParams();
        };
        // --- 概率范围调整 ---
        const adjustProbabilityRanges = () => {
          probabilityRanges.value.forEach(range => {
            if (range.start < start.value) range.start = start.value;
            if (range.end > end.value) range.end = end.value;
            if (range.start > range.end) range.start = range.end;
          });
        };
        // --- 概率范围管理 ---
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
// - 生命周期钩子 -
onMounted(() => {
  try {
    // 1. 先尝试从localStorage加载数据
    const savedGroups = localStorage.getItem('studentGroups');
    if (savedGroups) {
      studentGroups.value = JSON.parse(savedGroups);
    }
    if (studentGroups.value.length === 0) {
      studentGroups.value = [{ name: '默认组', students: [] }];
    }

    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      darkMode.value = savedDarkMode === 'true';
      document.body.classList.toggle('dark-mode', darkMode.value);
    }
  } catch (e) {
    console.error('Failed to load data from localStorage', e);
  }

  // 2. 在localStorage加载后，检查并应用URL参数（URL优先级最高）
  const urlParams = parseUrlParams();
  // 注意：这里只应用那些在URL中明确指定的参数，可以覆盖localStorage的默认值
  if (urlParams.start !== undefined) start.value = urlParams.start;
  if (urlParams.end !== undefined) end.value = urlParams.end;
  if (urlParams.mode) mode.value = urlParams.mode;
  if (urlParams.noRepeat !== undefined) noRepeat.value = urlParams.noRepeat;
  if (urlParams.operationMode) operationMode.value = urlParams.operationMode;
  if (urlParams.nameSize !== undefined) nameSize.value = urlParams.nameSize;
  if (urlParams.numberSize !== undefined) numberSize.value = urlParams.numberSize;
  if (urlParams.multiDrawCount !== undefined) multiDrawCount.value = urlParams.multiDrawCount;
  if (urlParams.batchSize !== undefined) batchSize.value = urlParams.batchSize;
  if (urlParams.probabilityRanges.length > 0) {
    probabilityRanges.value = urlParams.probabilityRanges;
  }

  // 3. 初始化逻辑（如添加默认概率范围、应用字体）
  if (probabilityRanges.value.length === 0) {
    addRange();
  }
  applyFontSettings();

  // 4. 最后，确保URL与当前状态完全同步（处理那些URL中没有但需要初始化的参数）
  updateUrlParams();
});
        // --- 侦听器 ---
        watch([
          start, end, mode, noRepeat, operationMode, nameSize, numberSize, multiDrawCount, batchSize, probabilityRanges
        ], updateUrlParams, { deep: true });
        watch([start, end], adjustProbabilityRanges);
        // --- 新增的模态框方法 ---
        const showModalWithConfig = (config) => {
          modalConfig.value = { ...config };
          // 如果需要输入，清空之前的输入值
          if (config.inputRequired) {
            modalConfig.value.inputValue = '';
          }
          showModal.value = true;
          // 在模态框打开后，延迟聚焦输入框
          if (config.inputRequired) {
            setTimeout(() => {
              if (modalInputRef.value) {
                modalInputRef.value.focus();
              }
            }, 300);
          }
        };
        const closeModal = () => {
          showModal.value = false;
        };
        const showDeleteGroupModal = (groupName, index) => {
          if (studentGroups.value.length <= 1) {
            showNotification('至少需要保留一个分组', 'error');
            return;
          }
          showModalWithConfig({
            title: '删除分组',
            message: `确定要删除"${groupName}"组吗？此操作不可撤销。`,
            confirmText: '删除',
            danger: true,
            onConfirm: () => {
              deleteGroup(groupName, index);
              closeModal();
            }
          });
        };
        const showClearGroupModal = () => {
          showModalWithConfig({
            title: '清空名单',
            message: `确定要清空"${currentGroup.value}"组的所有学生吗？`,
            confirmText: '清空',
            danger: true,
            onConfirm: () => {
              clearCurrentGroup();
              closeModal();
            }
          });
        };
        const showResetHistoryModal = () => {
          showModalWithConfig({
            title: '重置记录',
            message: '确定要重置已抽取记录吗？',
            confirmText: '重置',
            danger: true,
            onConfirm: () => {
              resetUsedNumbers();
              closeModal();
            }
          });
        };
        const showClearHistoryModal = () => {
          showModalWithConfig({
            title: '清除历史',
            message: '确定要清除所有历史记录吗？',
            confirmText: '清除',
            danger: true,
            onConfirm: () => {
              clearHistory();
              closeModal();
            }
          });
        };
        const showAddGroupModal = () => {
          showModalWithConfig({
            title: '新建组',
            message: '请输入新组名称：',
            inputRequired: true,
            inputPlaceholder: '例如：三年二班',
            confirmText: '创建',
            danger: false,
            onConfirm: addNewGroup
          });
        };
        const showRenameGroupModal = (groupName, index) => {
          showModalWithConfig({
            title: '重命名组',
            message: `请输入 "${groupName}" 的新名称：`,
            inputRequired: true,
            inputPlaceholder: '例如：三年三班',
            confirmText: '重命名',
            danger: false,
            onConfirm: () => renameGroup(groupName, index)
          });
        };
        // --- 返回供模板使用的数据和方法 ---
        return {
          // 状态
          isDragOver, isSetupPage, darkMode, showAdvanced, showBatchSettings,
          showMultiEffect, showCelebration, isContinuous, currentAnimationClass,
          showModal, modalConfig, modalInputRef,
          // 核心数据
          operationMode, start, end, mode, noRepeat, currentNumber, currentStudent,
          usedNumbers, multiDrawResults, studentGroups, currentGroup, probabilityRanges,
          celebrationMessage, notification, multiEffectNumber, multiEffectName,
          // UI设置
          nameSize, numberSize, multiDrawCount, batchSize,
          // 计算属性
          currentStudents, getTotalNumbers,
          // 方法
          showNotification, toggleDarkMode, handleDragEnter, handleDragOver,
          handleDragLeave, handleDrop, getRandomColor, getWeightedRandomNumber,
          applyAnimation, drawNumberWithAnimation, drawNumber, toggleContinuous,
          multiDrawWithAnimation, multiDraw, drawBatchNumbersWithAnimation,
          drawBatchNumbers, triggerCelebration, handleFileData, validateAndNavigate,
          goBack, resetUsedNumbers, clearHistory, selectFile, handleFileUpload,
          switchGroup, addNewGroup, renameGroup, deleteStudent, clearCurrentGroup, saveGroups,
          addRange, removeRange, applyFontSettings, adjustProbabilityRanges, deleteGroup,
          // 新增模态框方法
          showModalWithConfig, closeModal, showDeleteGroupModal, showClearGroupModal,
          showResetHistoryModal, showClearHistoryModal, showAddGroupModal, showRenameGroupModal
        };
      }
    }).mount('#app');
  