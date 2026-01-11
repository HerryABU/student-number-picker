
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
            batchSize: params.has('batchSize') ? parseInt(params.get('batchSize')) : 1
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
          const newUrl = window.location.pathname + '?' + params.toString();
          window.history.replaceState(null, '', newUrl);
        };
        // --- 通知系统 ---
        // 显示一个通知消息
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
        // 切换深色/日间模式
        const toggleDarkMode = () => {
          darkMode.value = !darkMode.value;
          document.body.classList.toggle('dark-mode', darkMode.value);
          localStorage.setItem('darkMode', darkMode.value);
        };
        // --- 文件上传处理 ---
        // 拖拽进入
        const handleDragEnter = () => {
          isDragOver.value = true;
        };
        // 拖拽悬停
        const handleDragOver = () => {
          isDragOver.value = true;
        };
        // 拖拽离开
        const handleDragLeave = () => {
          isDragOver.value = false;
        };
        // 处理文件拖放
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
        // 获取随机颜色，用于庆祝动画
        const getRandomColor = () => {
          const colors = ['#4361ee', '#4cc9f0', '#f72585', '#f8961e', '#7209b7', '#3a86ff'];
          return colors[Math.floor(Math.random() * colors.length)];
        };
        // 根据权重获取一个随机学号
        const getWeightedRandomNumber = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          if (available.length === 0) return null;
          // 如果没有设置概率范围，或处于名单模式，则使用均匀分布
          if (probabilityRanges.value.length === 0 || operationMode.value === 'list') {
            const index = Math.floor(Math.random() * available.length);
            return available[index];
          }
          // 根据权重构建抽取池
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
          // 进行加权随机抽取
          let random = Math.random() * totalWeight;
          for (const item of pool) {
            if (random < item.weight) return item.num;
            random -= item.weight;
          }
          return pool[0].num;
        };
        // --- 抽取动画 ---
        // 应用动画并执行回调
        const applyAnimation = (animationClass, callback) => {
          currentAnimationClass.value = animationClass;
          // 关键修改：立即执行回调函数，而不是等待动画结束
          if (callback) callback();
          // 但仍然在动画时间后移除动画类，以完成动画循环
          setTimeout(() => {
            currentAnimationClass.value = '';
          }, 500); // 动画持续时间
        };
        // --- 单次抽取 ---
        // 带有动画的单次抽取
        const drawNumberWithAnimation = () => {
          multiDrawResults.value = [];
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          if (available.length === 0) {
            triggerCelebration();
            return;
          }
          // 随机选择一个动画
          const animations = ['flip', 'popIn'];
          const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
          // 应用动画并立即执行抽取逻辑
          applyAnimation(randomAnimation, drawNumber);
        };
        // 执行单次抽取逻辑
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
        // 切换快速抽取的开始/停止
        const toggleContinuous = () => {
          if (isContinuous.value) {
            // 当前正在快速抽取，需要停止
            clearInterval(continuousIntervalId.value);
            isContinuous.value = false;

            // 关键修复：停止时，将最终显示的学号作为一次“单次抽取”来处理
            // 这确保了它会遵循“不重复”规则，并被正确记录
            drawNumber(); // 复用单次抽取的核心逻辑

          } else {
            // 当前未抽取，开始快速抽取
            isContinuous.value = true;
            // 使用 setInterval 代替 requestAnimationFrame，实现高速滚动
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
            }, 30); // 30ms 的间隔，速度非常快
          }
        };
        // --- 连抽 ---
        // 带有动画的连抽
        const multiDrawWithAnimation = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          const drawCount = Math.min(multiDrawCount.value, available.length);
          if (drawCount === 0) {
            showNotification('没有可抽取的学号了！', 'error');
            return;
          }
          // 对于连抽，使用 rollIn 动画
          applyAnimation('rollIn', multiDraw);
        };
        // 执行连抽逻辑
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
                  // 修复：始终只将最后一个结果作为“当前”结果
                  const lastResult = multiDrawResults.value[multiDrawResults.value.length - 1];
                  currentNumber.value = lastResult.student_id;
                  currentStudent.value = lastResult;
                  // 如果开启了不重复，则将所有结果都加入历史记录
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
            // 关键修复：在抽取循环内，确保本次抽取的结果不重复
            let result;
            let attempts = 0; // 防止无限循环
            do {
              result = getWeightedRandomNumber();
              attempts++;
              // 如果没有可用学号或尝试次数过多，则跳出
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
        // 带有动画的批量抽取
        const drawBatchNumbersWithAnimation = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          const actualSize = Math.min(batchSize.value, available.length);
          if (actualSize === 0) {
            showNotification('没有可抽取的学号了！', 'error');
            return;
          }
          // 对于批量抽取，也使用 rollIn 动画
          applyAnimation('rollIn', drawBatchNumbers);
        };
        // 执行批量抽取逻辑
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
              // 确保批次内不重复
              if (!batch.some(item => item.student_id === result.student_id)) {
                batch.push(result);
                // 如果开启了不重复，且该学号不在历史记录中，则加入
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
            // 修复：始终只将最后一个结果作为“当前”结果
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
        // 触发庆祝动画
        const triggerCelebration = (message = '所有学号已抽取完成！', duration = 3000) => {
          celebrationMessage.value = message;
          showCelebration.value = true;
          setTimeout(() => {
            showCelebration.value = false;
          }, duration);
        };
        // --- 文件处理 ---
        // 处理上传的文件数据
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
        // 验证设置并导航到主页面
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
            clearInterval(continuousIntervalId.value);
            isContinuous.value = false;
          }
          isSetupPage.value = true;
          updateUrlParams();
        };
        // --- 历史记录管理 ---
        // 重置已抽取记录
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
        // --- 文件上传辅助函数 ---
        // 选择文件
        const selectFile = () => {
          document.getElementById('fileInput').click();
        };
        // 处理文件上传事件
        const handleFileUpload = (event) => {
          const file = event.target.files[0];
          if (!file) return;
          handleFileData(file);
          event.target.value = '';
        };
        // --- 学生分组管理 ---
        // 切换当前分组
        const switchGroup = (groupName) => {
          currentGroup.value = groupName;
        };
        // 添加新分组
        const addNewGroup = () => {
          const name = prompt('请输入新组名称：');
          if (name && name.trim()) {
            if (!studentGroups.value.some(g => g.name === name)) {
              studentGroups.value.push({ name, students: [] });
              currentGroup.value = name;
              saveGroups();
              showNotification(`已创建新组: ${name}`);
            } else {
              showNotification('组名已存在', 'error');
            }
          }
        };
        // 删除学生
        const deleteStudent = (index) => {
          const groupIndex = studentGroups.value.findIndex(g => g.name === currentGroup.value);
          if (groupIndex >= 0) {
            studentGroups.value[groupIndex].students.splice(index, 1);
            saveGroups();
            showNotification('学生已删除');
          }
        };
        // 清空当前组
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
        // 删除分组
        const deleteGroup = (groupName, index) => {
          if (studentGroups.value.length <= 1) {
            showNotification('至少需要保留一个分组', 'error');
            return;
          }
          const confirmed = confirm(`确定要删除"${groupName}"组吗？此操作不可撤销。`);
          if (confirmed) {
            // 如果要删除的是当前分组，则切换到另一个分组
            if (currentGroup.value === groupName) {
              const otherIndex = index === 0 ? 1 : 0;
              currentGroup.value = studentGroups.value[otherIndex].name;
            }
            studentGroups.value.splice(index, 1);
            saveGroups();
            showNotification(`已删除组: ${groupName}`);
          }
        };
        // --- 数据持久化 ---
        // 保存学生分组到 localStorage
        const saveGroups = () => {
          localStorage.setItem('studentGroups', JSON.stringify(studentGroups.value));
        };
        // --- 字号设置 ---
        // 应用字号设置
        const applyFontSettings = () => {
          document.documentElement.style.setProperty('--name-size', nameSize.value + 'rem');
          document.documentElement.style.setProperty('--number-size', numberSize.value + 'pt');
          showNotification('字号设置已应用');
          updateUrlParams();
        };
        // --- 概率范围调整 ---
        // 调整概率范围，确保其在学号范围内
        const adjustProbabilityRanges = () => {
          probabilityRanges.value.forEach(range => {
            if (range.start < start.value) range.start = start.value;
            if (range.end > end.value) range.end = end.value;
            if (range.start > range.end) range.start = range.end;
          });
        };
        // --- 概率范围管理 ---
        // 添加一个新的概率范围
        const addRange = () => {
          probabilityRanges.value.push({ 
            start: start.value, 
            end: end.value, 
            weight: 50 
          });
        };
        // 移除一个概率范围
        const removeRange = (index) => {
          probabilityRanges.value.splice(index, 1);
        };
        // --- 生命周期钩子 ---
        // 组件挂载后执行
        onMounted(() => {
          try {
            // 从 localStorage 加载学生分组
            const savedGroups = localStorage.getItem('studentGroups');
            if (savedGroups) {
              studentGroups.value = JSON.parse(savedGroups);
            }
            // 如果没有分组，则创建默认组
            if (studentGroups.value.length === 0) {
              studentGroups.value = [{ name: '默认组', students: [] }];
            }
            // 从 localStorage 加载深色模式设置
            const savedDarkMode = localStorage.getItem('darkMode');
            if (savedDarkMode !== null) {
              darkMode.value = savedDarkMode === 'true';
              document.body.classList.toggle('dark-mode', darkMode.value);
            }
          } catch (e) {
            console.error('Failed to load data from localStorage', e);
          }
          // 如果没有概率范围，则添加一个默认范围
          if (probabilityRanges.value.length === 0) {
            addRange();
          }
          // 应用初始字号设置
          applyFontSettings();
          // 解析并应用URL参数
          const urlParams = parseUrlParams();
          start.value = urlParams.start;
          end.value = urlParams.end;
          mode.value = urlParams.mode;
          noRepeat.value = urlParams.noRepeat;
          operationMode.value = urlParams.operationMode;
          nameSize.value = urlParams.nameSize;
          numberSize.value = urlParams.numberSize;
          multiDrawCount.value = urlParams.multiDrawCount;
          batchSize.value = urlParams.batchSize;
        });
        // --- 侦听器 ---
        // 侦听多个设置项的变化，同步到URL
        watch([
          start, end, mode, noRepeat, operationMode, nameSize, numberSize, multiDrawCount, batchSize
        ], updateUrlParams, { deep: true });
        // 侦听起始和结束学号的变化，调整概率范围
        watch([start, end], adjustProbabilityRanges);
        // --- 返回供模板使用的数据和方法 ---
        return {
          // 状态
          isDragOver, isSetupPage, darkMode, showAdvanced, showBatchSettings,
          showMultiEffect, showCelebration, isContinuous, currentAnimationClass,
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
          switchGroup, addNewGroup, deleteStudent, clearCurrentGroup, saveGroups,
          addRange, removeRange, applyFontSettings, adjustProbabilityRanges, deleteGroup
        };
      }
    }).mount('#app');
  