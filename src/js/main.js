// NB抽学号系统主逻辑
class NBStudentRoller {
  constructor() {
    // 基础状态
    this.isDragOver = false;
    this.isSetupPage = true;
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    this.showAdvanced = false;
    this.showBatchSettings = false;
    this.showMultiEffect = false;
    this.showCelebration = false;
    this.isContinuous = false;
    
    // 模态框状态
    this.showModal = false;
    this.modalConfig = {};
    this.modalInputRef = null;
    
    // 新增：惊心动魄模式
    this.isTensionMode = false;
    this.tensionIntervalId = null;
    this.tensionCount = 0;
    this.tensionMaxCount = 20;
    this.tensionSpeed = 100;
    
    // 新增：转盘模式
    this.isRouletteMode = false;
    this.rouletteWheel = null;
    
    // 新增：立体转盘模式
    this.isRoulette3DMode = false;
    
    // 新增：翻卡片模式
    this.isFlipCardMode = false;
    
    // 新增：PK模式
    this.isPKMode = false;
    this.pkPlayers = { male: [], female: [] };
    this.pkCurrentRound = 0;
    this.pkResults = [];
    
    // 新增：男女生模式
    this.genderMode = 'all'; // 'all', 'male', 'female'
    
    // 新增：节日模式
    this.festivalMode = 'none'; // 'none', 'chinese_new_year', 'dragon_boat', etc.
    
    // 新增：音频控制
    this.audioEnabled = true;
    this.ttsEnabled = true;
    
    // 核心数据
    this.operationMode = 'range'; // 'range' or 'list'
    this.start = 1;
    this.end = 50;
    this.mode = 'single'; // 'single', 'continuous', 'batch', 'multi'
    this.noRepeat = true;
    this.currentNumber = null;
    this.currentStudent = null;
    this.usedNumbers = [];
    this.multiDrawResults = [];
    this.studentGroups = [{ name: '默认分组', students: [] }];
    this.currentGroup = 0;
    this.probabilityRanges = [];
    
    // UI设置
    this.nameSize = 5;
    this.numberSize = 80;
    this.multiDrawCount = 5;
    this.batchSize = 1;
    
    // 计算属性相关
    this.currentStudents = [];
    this.getTotalNumbers = 0;
    
    // 动画相关
    this.currentAnimationClass = '';
    
    // 消息通知
    this.notification = { message: '', show: false };
    
    // 多人抽取相关
    this.multiEffectNumber = '';
    this.multiEffectName = '';
    
    // 初始化
    this.init();
  }

  // 初始化
  init() {
    this.applyTheme();
    this.updateFestivalUI();
    this.bindEvents();
  }

  // 绑定事件
  bindEvents() {
    // 拖拽事件
    document.addEventListener('dragenter', this.handleDragEnter.bind(this));
    document.addEventListener('dragover', this.handleDragOver.bind(this));
    document.addEventListener('dragleave', this.handleDragLeave.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));
    
    // 音频控制按钮事件
    const soundBtn = document.querySelector('.sound-control');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        this.audioEnabled = audioManager.toggleAudio();
        soundBtn.innerHTML = this.audioEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
      });
    }
  }

  // 应用主题
  applyTheme() {
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  // 切换深色模式
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    this.applyTheme();
    localStorage.setItem('darkMode', this.darkMode);
  }

  // 处理拖拽进入
  handleDragEnter(e) {
    e.preventDefault();
    this.isDragOver = true;
    const uploadArea = document.querySelector('.file-upload');
    if (uploadArea) {
      uploadArea.classList.add('drag-over');
    }
  }

  // 处理拖拽悬停
  handleDragOver(e) {
    e.preventDefault();
  }

  // 处理拖拽离开
  handleDragLeave(e) {
    e.preventDefault();
    this.isDragOver = false;
    const uploadArea = document.querySelector('.file-upload');
    if (uploadArea) {
      uploadArea.classList.remove('drag-over');
    }
  }

  // 处理文件拖放
  handleDrop(e) {
    e.preventDefault();
    this.isDragOver = false;
    const uploadArea = document.querySelector('.file-upload');
    if (uploadArea) {
      uploadArea.classList.remove('drag-over');
    }
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      this.handleFileUpload(files[0]);
    }
  }

  // 获取随机颜色
  getRandomColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // 加权随机数获取
  getWeightedRandomNumber() {
    // 如果有概率权重设置，使用加权随机
    if (this.probabilityRanges && this.probabilityRanges.length > 0) {
      // 实现加权随机逻辑
      const available = this.getAvailableStudents();
      if (available.length === 0) return null;
      
      // 简单的加权随机实现
      return available[Math.floor(Math.random() * available.length)];
    } else {
      const available = this.getAvailableStudents();
      if (available.length === 0) return null;
      return available[Math.floor(Math.random() * available.length)];
    }
  }

  // 获取可用学生列表
  getAvailableStudents() {
    const currentGroup = this.studentGroups[this.currentGroup];
    if (!currentGroup) return [];
    
    let students = currentGroup.students;
    
    // 根据性别模式过滤
    if (this.genderMode !== 'all') {
      students = students.filter(student => student.gender === this.genderMode);
    }
    
    // 如果启用不重复抽取，排除已抽取的学生
    if (this.noRepeat && this.usedNumbers.length > 0) {
      students = students.filter(student => 
        !this.usedNumbers.includes(student.student_id)
      );
    }
    
    return students;
  }

  // 应用动画效果
  applyAnimation() {
    // 生成随机动画类
    const animations = [
      'animate__animated animate__bounce',
      'animate__animated animate__fadeInUp',
      'animate__animated animate__zoomIn',
      'animate__animated animate__pulse',
      'animate__animated animate__rubberBand'
    ];
    this.currentAnimationClass = animations[Math.floor(Math.random() * animations.length)];
  }

  // 带动画的抽取
  drawNumberWithAnimation() {
    this.applyAnimation();
    
    setTimeout(() => {
      this.drawNumber();
    }, 300);
  }

  // 抽取号码
  drawNumber() {
    if (this.isTensionMode) {
      this.startTensionMode();
      return;
    }

    if (this.isRouletteMode) {
      this.startRouletteMode();
      return;
    }

    if (this.isPKMode) {
      this.startPKMode();
      return;
    }

    const available = this.getAvailableStudents();
    if (available.length === 0) {
      this.showNotification('没有可抽取的学生！', 'error');
      return;
    }

    const selected = this.getWeightedRandomNumber();
    this.currentStudent = selected;
    this.currentNumber = selected.student_id;

    // 播放音效
    if (this.audioEnabled) {
      audioManager.playSound('draw');
    }

    // 朗读姓名
    if (this.ttsEnabled && selected.name) {
      audioManager.speakName(selected.name);
    }

    // 如果启用不重复抽取，添加到已使用列表
    if (this.noRepeat) {
      this.usedNumbers.push(selected.student_id);
    }

    // 添加到历史记录
    this.addToHistory(selected);
  }

  // 开始惊心动魄模式
  startTensionMode() {
    if (this.isTensionMode) return;
    
    this.isTensionMode = true;
    this.tensionCount = 0;

    const available = this.getAvailableStudents();
    if (available.length === 0) {
      this.showNotification('没有可抽取的学生！', 'error');
      this.isTensionMode = false;
      return;
    }

    // 预先选定最终结果
    const finalResult = this.getWeightedRandomNumber();

    this.tensionIntervalId = setInterval(() => {
      this.tensionCount++;
      
      // 随机显示一个可用的学生（非最终结果）
      const randomIndex = Math.floor(Math.random() * available.length);
      this.currentNumber = available[randomIndex].student_id;
      this.currentStudent = available[randomIndex];

      // 播放紧张音效
      if (this.audioEnabled) {
        audioManager.playSound('tension');
      }

      // 达到最大次数，停止闪烁，显示最终结果
      if (this.tensionCount >= this.tensionMaxCount) {
        clearInterval(this.tensionIntervalId);
        this.isTensionMode = false;
        
        // 应用最终结果
        this.currentNumber = finalResult.student_id;
        this.currentStudent = finalResult;

        // 播放庆祝音效
        if (this.audioEnabled) {
          audioManager.playSound('celebration');
        }

        // 朗读姓名
        if (this.ttsEnabled && finalResult.name) {
          audioManager.speakName(finalResult.name);
        }

        // 如果启用不重复抽取，添加到已使用列表
        if (this.noRepeat) {
          this.usedNumbers.push(finalResult.student_id);
        }

        // 添加到历史记录
        this.addToHistory(finalResult);
      }
    }, this.tensionSpeed);
  }

  // 开始转盘模式
  startRouletteMode() {
    if (!this.rouletteWheel) {
      this.rouletteWheel = document.querySelector('.roulette-wheel');
    }
    
    if (!this.rouletteWheel) {
      console.error('Roulette wheel not found');
      return;
    }

    // 播放转盘音效
    if (this.audioEnabled) {
      audioManager.playRouletteSound();
    }

    // 随机旋转圈数和角度
    const extraRotation = 3600; // 10圈
    const randomDegree = Math.floor(Math.random() * 360);
    const totalRotation = extraRotation + randomDegree;
    
    this.rouletteWheel.style.transform = `rotate(${totalRotation}deg)`;

    // 获取结果
    setTimeout(() => {
      const available = this.getAvailableStudents();
      if (available.length === 0) {
        this.showNotification('没有可抽取的学生！', 'error');
        return;
      }

      const selected = available[Math.floor(Math.random() * available.length)];
      this.currentStudent = selected;
      this.currentNumber = selected.student_id;

      // 朗读姓名
      if (this.ttsEnabled && selected.name) {
        audioManager.speakName(selected.name);
      }

      // 如果启用不重复抽取，添加到已使用列表
      if (this.noRepeat) {
        this.usedNumbers.push(selected.student_id);
      }

      // 添加到历史记录
      this.addToHistory(selected);
    }, 4000); // 等待转盘动画结束
  }

  // 开始PK模式
  startPKMode() {
    // 播放PK开始音效
    if (this.audioEnabled) {
      audioManager.playPKSound('start');
    }

    // 获取男女学生列表
    const maleStudents = this.studentGroups[this.currentGroup]?.students.filter(s => s.gender === 'male') || [];
    const femaleStudents = this.studentGroups[this.currentGroup]?.students.filter(s => s.gender === 'female') || [];

    if (maleStudents.length === 0 || femaleStudents.length === 0) {
      this.showNotification('PK模式需要至少一名男生和一名女生！', 'error');
      return;
    }

    // 随机选择男女学生进行PK
    const malePK = maleStudents[Math.floor(Math.random() * maleStudents.length)];
    const femalePK = femaleStudents[Math.floor(Math.random() * femaleStudents.length)];

    // 显示击剑动画
    this.showPKSwordAnimation();

    // 模拟PK结果
    setTimeout(() => {
      const winner = Math.random() > 0.5 ? malePK : femalePK;
      this.currentStudent = winner;
      this.currentNumber = winner.student_id;

      // 播放胜利音效
      if (this.audioEnabled) {
        audioManager.playPKSound('win');
      }

      // 朗读姓名
      if (this.ttsEnabled && winner.name) {
        audioManager.speakName(winner.name);
      }

      // 如果启用不重复抽取，添加到已使用列表
      if (this.noRepeat) {
        this.usedNumbers.push(winner.student_id);
      }

      // 添加到历史记录
      this.addToHistory(winner);
    }, 2000);
  }

  // 显示击剑动画
  showPKSwordAnimation() {
    const pkSwords = document.querySelector('.pk-swords');
    if (pkSwords) {
      pkSwords.innerHTML = `
        <div class="sword left pk-animation"></div>
        <div class="sword right pk-animation"></div>
      `;
      
      setTimeout(() => {
        if (pkSwords) {
          pkSwords.innerHTML = '';
        }
      }, 2000);
    }
  }

  // 连续抽取模式切换
  toggleContinuous() {
    this.isContinuous = !this.isContinuous;
    if (this.isContinuous) {
      this.continuousDrawInterval = setInterval(() => {
        if (!this.isTensionMode) {
          this.drawNumber();
        }
      }, 1500);
    } else {
      if (this.continuousDrawInterval) {
        clearInterval(this.continuousDrawInterval);
      }
    }
  }

  // 连抽带动画
  multiDrawWithAnimation() {
    this.applyAnimation();
    
    setTimeout(() => {
      this.multiDraw();
    }, 300);
  }

  // 连抽功能
  multiDraw() {
    const available = this.getAvailableStudents();
    if (available.length === 0) {
      this.showNotification('没有可抽取的学生！', 'error');
      return;
    }

    // 确定抽取数量
    const drawCount = Math.min(this.multiDrawCount, available.length);
    const selectedStudents = [];

    for (let i = 0; i < drawCount; i++) {
      if (available.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * available.length);
      const selected = available.splice(randomIndex, 1)[0];
      selectedStudents.push(selected);
      
      // 如果启用不重复抽取，添加到已使用列表
      if (this.noRepeat) {
        this.usedNumbers.push(selected.student_id);
      }
    }

    this.multiDrawResults = selectedStudents;

    // 朗读所有被抽中的姓名
    if (this.ttsEnabled) {
      selectedStudents.forEach(student => {
        setTimeout(() => {
          audioManager.speakName(student.name);
        }, 500 * selectedStudents.indexOf(student));
      });
    }

    // 添加到历史记录
    selectedStudents.forEach(student => {
      this.addToHistory(student);
    });
  }

  // 批量抽取带动画
  drawBatchNumbersWithAnimation() {
    this.applyAnimation();
    
    setTimeout(() => {
      this.drawBatchNumbers();
    }, 300);
  }

  // 批量抽取
  drawBatchNumbers() {
    const available = this.getAvailableStudents();
    if (available.length === 0) {
      this.showNotification('没有可抽取的学生！', 'error');
      return;
    }

    // 确定抽取数量
    const drawCount = Math.min(this.batchSize, available.length);
    const selectedStudents = [];

    for (let i = 0; i < drawCount; i++) {
      if (available.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * available.length);
      const selected = available.splice(randomIndex, 1)[0];
      selectedStudents.push(selected);
      
      // 如果启用不重复抽取，添加到已使用列表
      if (this.noRepeat) {
        this.usedNumbers.push(selected.student_id);
      }
    }

    // 显示庆祝动画
    this.triggerCelebration(selectedStudents);

    // 朗读所有被抽中的姓名
    if (this.ttsEnabled) {
      selectedStudents.forEach(student => {
        setTimeout(() => {
          audioManager.speakName(student.name);
        }, 500 * selectedStudents.indexOf(student));
      });
    }

    // 添加到历史记录
    selectedStudents.forEach(student => {
      this.addToHistory(student);
    });
  }

  // 触发庆祝动画
  triggerCelebration(students) {
    this.showCelebration = true;
    
    // 创建庆祝元素
    const celebrationEl = document.createElement('div');
    celebrationEl.className = 'celebration';
    
    // 生成彩带效果
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = this.getRandomColor();
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = Math.random() * 10 + 5 + 'px';
      celebrationEl.appendChild(confetti);
    }
    
    document.body.appendChild(celebrationEl);
    
    // 3秒后移除庆祝元素
    setTimeout(() => {
      if (celebrationEl.parentNode) {
        celebrationEl.parentNode.removeChild(celebrationEl);
      }
      this.showCelebration = false;
    }, 3000);
  }

  // 显示通知
  showNotification(message, type = 'info') {
    this.notification = { message, show: true };
    
    // 根据类型设置样式
    const notificationEl = document.querySelector('.notification');
    if (notificationEl) {
      notificationEl.textContent = message;
      notificationEl.className = `notification ${type}`;
      notificationEl.classList.add('show');
      
      setTimeout(() => {
        if (notificationEl) {
          notificationEl.classList.remove('show');
        }
      }, 3000);
    }
  }

  // 处理文件数据
  handleFileData(data) {
    // 实现文件数据处理逻辑
    // 这里应该解析Excel数据并更新学生列表
    try {
      // 假设数据格式为包含学生信息的数组
      // 每个学生对象包含 id, name, gender 等字段
      if (Array.isArray(data) && data.length > 0) {
        // 更新当前分组的学生列表
        this.studentGroups[this.currentGroup].students = data.map((item, index) => {
          return {
            student_id: item.id || (index + 1),
            name: item.name || `学生${index + 1}`,
            gender: item.gender || 'unknown' // 'male', 'female', 'unknown'
          };
        });
        
        this.showNotification(`成功导入 ${data.length} 名学生`, 'success');
      }
    } catch (e) {
      this.showNotification('文件处理出错: ' + e.message, 'error');
    }
  }

  // 验证并导航
  validateAndNavigate() {
    if (this.operationMode === 'range') {
      if (this.start >= this.end) {
        this.showNotification('起始学号必须小于结束学号', 'error');
        return false;
      }
    }
    
    this.isSetupPage = false;
    return true;
  }

  // 返回设置页面
  goBack() {
    // 清理惊心动魄模式的定时器
    if (this.tensionIntervalId) {
      clearInterval(this.tensionIntervalId);
      this.tensionIntervalId = null;
      this.isTensionMode = false;
    }
    
    // 清理连续抽取的定时器
    if (this.continuousDrawInterval) {
      clearInterval(this.continuousDrawInterval);
      this.continuousDrawInterval = null;
      this.isContinuous = false;
    }
    
    this.isSetupPage = true;
  }

  // 重置已使用号码列表
  resetUsedNumbers() {
    this.usedNumbers = [];
    this.showNotification('已重置抽取记录', 'success');
  }

  // 清空历史记录
  clearHistory() {
    // 这里需要清空历史记录
    this.showNotification('已清空历史记录', 'success');
  }

  // 选择文件
  selectFile() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.click();
    }
  }

  // 处理文件上传
  handleFileUpload(file) {
    // 检查文件类型
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      this.showNotification('不支持的文件格式，请上传Excel或CSV文件', 'error');
      return;
    }

    // 这里需要实现文件读取逻辑
    // 使用XLSX库读取Excel文件
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // 模拟读取结果
        const data = this.parseFileData(e.target.result, fileExtension);
        this.handleFileData(data);
      } catch (error) {
        this.showNotification('文件解析失败: ' + error.message, 'error');
      }
    };
    
    reader.onerror = () => {
      this.showNotification('文件读取失败', 'error');
    };
    
    reader.readAsArrayBuffer(file);
  }

  // 解析文件数据
  parseFileData(fileData, extension) {
    // 这里应该使用XLSX库来解析数据
    // 为了简化，返回模拟数据
    return [
      { id: 1, name: '张三', gender: 'male' },
      { id: 2, name: '李四', gender: 'female' },
      { id: 3, name: '王五', gender: 'male' },
      { id: 4, name: '赵六', gender: 'female' },
      { id: 5, name: '钱七', gender: 'male' }
    ];
  }

  // 切换分组
  switchGroup(index) {
    this.currentGroup = index;
  }

  // 添加新分组
  addNewGroup() {
    const newGroupName = `分组${this.studentGroups.length + 1}`;
    this.studentGroups.push({
      name: newGroupName,
      students: []
    });
    this.currentGroup = this.studentGroups.length - 1;
    this.showNotification(`已添加新分组: ${newGroupName}`, 'success');
  }

  // 重命名分组
  renameGroup(oldName, index) {
    // 实现重命名逻辑
  }

  // 删除学生
  deleteStudent(studentIndex) {
    if (this.studentGroups[this.currentGroup]) {
      this.studentGroups[this.currentGroup].students.splice(studentIndex, 1);
      this.showNotification('已删除学生', 'success');
    }
  }

  // 清空当前分组
  clearCurrentGroup() {
    if (this.studentGroups[this.currentGroup]) {
      this.studentGroups[this.currentGroup].students = [];
      this.showNotification('已清空当前分组', 'success');
    }
  }

  // 保存分组
  saveGroups() {
    // 实现保存逻辑
    localStorage.setItem('studentGroups', JSON.stringify(this.studentGroups));
    this.showNotification('已保存分组信息', 'success');
  }

  // 添加范围
  addRange() {
    // 实现添加概率范围逻辑
  }

  // 移除范围
  removeRange(index) {
    this.probabilityRanges.splice(index, 1);
  }

  // 应用字体设置
  applyFontSettings() {
    const nameSizePx = this.nameSize + 'rem';
    const numberSizePx = this.numberSize + 'pt';
    
    document.documentElement.style.setProperty('--name-size', nameSizePx);
    document.documentElement.style.setProperty('--number-size', numberSizePx);
  }

  // 调整概率范围
  adjustProbabilityRanges() {
    // 实现概率范围调整逻辑
  }

  // 删除分组
  deleteGroup(index) {
    if (this.studentGroups.length <= 1) {
      this.showNotification('至少需要保留一个分组', 'error');
      return;
    }
    
    this.studentGroups.splice(index, 1);
    if (this.currentGroup >= this.studentGroups.length) {
      this.currentGroup = this.studentGroups.length - 1;
    }
    this.showNotification('已删除分组', 'success');
  }

  // 添加到历史记录
  addToHistory(student) {
    // 实现添加到历史记录的逻辑
    console.log('Added to history:', student);
  }

  // 更新节日UI
  updateFestivalUI() {
    // 移除所有节日类
    document.body.classList.remove(
      'festival-chinese-new-year',
      'festival-dragon-boat',
      'festival-mid-autumn',
      'festival-double-ninth',
      'festival-national-day',
      'festival-christmas',
      'festival-halloween'
    );

    // 根据当前节日模式添加对应类
    switch (this.festivalMode) {
      case 'chinese_new_year':
        document.body.classList.add('festival-chinese-new-year');
        break;
      case 'dragon_boat':
        document.body.classList.add('festival-dragon-boat');
        break;
      case 'mid_autumn':
        document.body.classList.add('festival-mid-autumn');
        break;
      case 'double_ninth':
        document.body.classList.add('festival-double-ninth');
        break;
      case 'national_day':
        document.body.classList.add('festival-national-day');
        break;
      case 'christmas':
        document.body.classList.add('festival-christmas');
        break;
      case 'halloween':
        document.body.classList.add('festival-halloween');
        break;
    }
  }

  // 切换节日模式
  toggleFestivalMode(mode) {
    this.festivalMode = mode;
    this.updateFestivalUI();
    localStorage.setItem('festivalMode', mode);
  }

  // 切换性别模式
  toggleGenderMode(mode) {
    this.genderMode = mode;
    this.showNotification(`已切换到${mode === 'all' ? '全部' : mode === 'male' ? '男生' : '女生'}模式`, 'info');
  }

  // 切换转盘模式
  toggleRouletteMode() {
    this.isRouletteMode = !this.isRouletteMode;
    this.isRoulette3DMode = false;
    this.isFlipCardMode = false;
    this.isPKMode = false;
    
    const rouletteContainer = document.querySelector('.roulette-container');
    const roulette3DContainer = document.querySelector('.roulette-3d-container');
    const flipCardContainer = document.querySelector('.flip-card-container');
    const pkModeContainer = document.querySelector('.pk-mode-container');
    
    if (rouletteContainer) rouletteContainer.style.display = this.isRouletteMode ? 'block' : 'none';
    if (roulette3DContainer) roulette3DContainer.style.display = 'none';
    if (flipCardContainer) flipCardContainer.style.display = 'none';
    if (pkModeContainer) pkModeContainer.style.display = 'none';
  }

  // 切换立体转盘模式
  toggleRoulette3DMode() {
    this.isRoulette3DMode = !this.isRoulette3DMode;
    this.isRouletteMode = false;
    this.isFlipCardMode = false;
    this.isPKMode = false;
    
    const rouletteContainer = document.querySelector('.roulette-container');
    const roulette3DContainer = document.querySelector('.roulette-3d-container');
    const flipCardContainer = document.querySelector('.flip-card-container');
    const pkModeContainer = document.querySelector('.pk-mode-container');
    
    if (roulette3DContainer) roulette3DContainer.style.display = this.isRoulette3DMode ? 'block' : 'none';
    if (rouletteContainer) rouletteContainer.style.display = 'none';
    if (flipCardContainer) flipCardContainer.style.display = 'none';
    if (pkModeContainer) pkModeContainer.style.display = 'none';
  }

  // 切换翻卡片模式
  toggleFlipCardMode() {
    this.isFlipCardMode = !this.isFlipCardMode;
    this.isRouletteMode = false;
    this.isRoulette3DMode = false;
    this.isPKMode = false;
    
    const rouletteContainer = document.querySelector('.roulette-container');
    const roulette3DContainer = document.querySelector('.roulette-3d-container');
    const flipCardContainer = document.querySelector('.flip-card-container');
    const pkModeContainer = document.querySelector('.pk-mode-container');
    
    if (flipCardContainer) flipCardContainer.style.display = this.isFlipCardMode ? 'block' : 'none';
    if (rouletteContainer) rouletteContainer.style.display = 'none';
    if (roulette3DContainer) roulette3DContainer.style.display = 'none';
    if (pkModeContainer) pkModeContainer.style.display = 'none';
    
    // 如果启用了翻卡片模式，自动翻转卡片
    if (this.isFlipCardMode) {
      setTimeout(() => {
        const flipCard = document.querySelector('.flip-card');
        if (flipCard) {
          flipCard.classList.add('flipped');
        }
      }, 1000);
    }
  }

  // 切换PK模式
  togglePKMode() {
    this.isPKMode = !this.isPKMode;
    this.isRouletteMode = false;
    this.isRoulette3DMode = false;
    this.isFlipCardMode = false;
    
    const rouletteContainer = document.querySelector('.roulette-container');
    const roulette3DContainer = document.querySelector('.roulette-3d-container');
    const flipCardContainer = document.querySelector('.flip-card-container');
    const pkModeContainer = document.querySelector('.pk-mode-container');
    
    if (pkModeContainer) pkModeContainer.style.display = this.isPKMode ? 'block' : 'none';
    if (rouletteContainer) rouletteContainer.style.display = 'none';
    if (roulette3DContainer) roulette3DContainer.style.display = 'none';
    if (flipCardContainer) flipCardContainer.style.display = 'none';
  }

  // 模态框相关方法
  showModalWithConfig(config) {
    this.modalConfig = config;
    this.showModal = true;
    
    // 在下一个tick后聚焦输入框
    setTimeout(() => {
      const input = document.querySelector('.modal-input');
      if (input) {
        input.focus();
      }
    }, 100);
  }

  closeModal() {
    this.showModal = false;
    this.modalConfig = {};
  }

  showDeleteGroupModal(groupName, index) {
    this.showModalWithConfig({
      title: '删除分组',
      message: `确定要删除分组 "${groupName}" 吗？此操作不可撤销。`,
      confirmText: '删除',
      danger: true,
      onConfirm: () => this.deleteGroup(index)
    });
  }

  showClearGroupModal(groupName, index) {
    this.showModalWithConfig({
      title: '清空分组',
      message: `确定要清空分组 "${groupName}" 吗？`,
      confirmText: '清空',
      danger: true,
      onConfirm: () => this.clearCurrentGroup()
    });
  }

  showResetHistoryModal() {
    this.showModalWithConfig({
      title: '重置抽取记录',
      message: '确定要重置所有抽取记录吗？',
      confirmText: '重置',
      danger: true,
      onConfirm: () => this.resetUsedNumbers()
    });
  }

  showClearHistoryModal() {
    this.showModalWithConfig({
      title: '清空历史记录',
      message: '确定要清空所有历史记录吗？',
      confirmText: '清空',
      danger: true,
      onConfirm: () => this.clearHistory()
    });
  }

  showAddGroupModal() {
    this.showModalWithConfig({
      title: '添加分组',
      message: '请输入新分组的名称：',
      inputRequired: true,
      inputPlaceholder: '例如：三年二班',
      confirmText: '添加',
      danger: false,
      onConfirm: (groupName) => {
        if (groupName.trim()) {
          this.studentGroups.push({
            name: groupName.trim(),
            students: []
          });
          this.currentGroup = this.studentGroups.length - 1;
          this.showNotification(`已添加新分组: ${groupName.trim()}`, 'success');
        }
      }
    });
  }

  showRenameGroupModal(groupName, index) {
    this.showModalWithConfig({
      title: '重命名组',
      message: `请输入 "${groupName}" 的新名称：`,
      inputRequired: true,
      inputPlaceholder: '例如：三年三班',
      confirmText: '重命名',
      danger: false,
      onConfirm: (newName) => {
        if (newName.trim()) {
          this.studentGroups[index].name = newName.trim();
          this.showNotification('分组已重命名', 'success');
        }
      }
    });
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
  // 检查是否支持Vue 3
  if (typeof Vue !== 'undefined') {
    // 使用Vue 3创建应用
    const { createApp, ref, computed, onMounted } = Vue;
    
    createApp({
      setup() {
        // 创建NBStudentRoller实例
        const roller = new NBStudentRoller();
        
        // 懒加载工具模块
        onMounted(async () => {
          await utils.loadModule('animation');
        });
        
        // 将roller的属性和方法暴露给模板
        return {
          // 状态
          isDragOver: ref(roller.isDragOver),
          isSetupPage: ref(roller.isSetupPage),
          darkMode: ref(roller.darkMode),
          showAdvanced: ref(roller.showAdvanced),
          showBatchSettings: ref(roller.showBatchSettings),
          showMultiEffect: ref(roller.showMultiEffect),
          showCelebration: ref(roller.showCelebration),
          isContinuous: ref(roller.isContinuous),
          currentAnimationClass: ref(roller.currentAnimationClass),
          showModal: ref(roller.showModal),
          modalConfig: ref(roller.modalConfig),
          modalInputRef: ref(roller.modalInputRef),
          // 新增：惊心动魄模式
          isTensionMode: ref(roller.isTensionMode),
          tensionMaxCount: ref(roller.tensionMaxCount),
          tensionSpeed: ref(roller.tensionSpeed),
          // 新增：转盘模式
          isRouletteMode: ref(roller.isRouletteMode),
          isRoulette3DMode: ref(roller.isRoulette3DMode),
          isFlipCardMode: ref(roller.isFlipCardMode),
          isPKMode: ref(roller.isPKMode),
          // 新增：性别模式
          genderMode: ref(roller.genderMode),
          // 新增：节日模式
          festivalMode: ref(roller.festivalMode),
          // 新增：音频控制
          audioEnabled: ref(roller.audioEnabled),
          ttsEnabled: ref(roller.ttsEnabled),
          // 核心数据
          operationMode: ref(roller.operationMode),
          start: ref(roller.start),
          end: ref(roller.end),
          mode: ref(roller.mode),
          noRepeat: ref(roller.noRepeat),
          currentNumber: ref(roller.currentNumber),
          currentStudent: ref(roller.currentStudent),
          usedNumbers: ref(roller.usedNumbers),
          multiDrawResults: ref(roller.multiDrawResults),
          studentGroups: ref(roller.studentGroups),
          currentGroup: ref(roller.currentGroup),
          probabilityRanges: ref(roller.probabilityRanges),
          celebrationMessage: ref(''),
          notification: ref(roller.notification),
          multiEffectNumber: ref(roller.multiEffectNumber),
          multiEffectName: ref(roller.multiEffectName),
          // UI设置
          nameSize: ref(roller.nameSize),
          numberSize: ref(roller.numberSize),
          multiDrawCount: ref(roller.multiDrawCount),
          batchSize: ref(roller.batchSize),
          // 计算属性
          currentStudents: computed(() => roller.getAvailableStudents()),
          getTotalNumbers: computed(() => {
            const group = roller.studentGroups[roller.currentGroup];
            return group ? group.students.length : 0;
          }),
          // 方法
          showNotification: roller.showNotification.bind(roller),
          toggleDarkMode: roller.toggleDarkMode.bind(roller),
          handleDragEnter: roller.handleDragEnter.bind(roller),
          handleDragOver: roller.handleDragOver.bind(roller),
          handleDragLeave: roller.handleDragLeave.bind(roller),
          handleDrop: roller.handleDrop.bind(roller),
          getRandomColor: roller.getRandomColor.bind(roller),
          getWeightedRandomNumber: roller.getWeightedRandomNumber.bind(roller),
          applyAnimation: roller.applyAnimation.bind(roller),
          drawNumberWithAnimation: roller.drawNumberWithAnimation.bind(roller),
          drawNumber: roller.drawNumber.bind(roller),
          toggleContinuous: roller.toggleContinuous.bind(roller),
          multiDrawWithAnimation: roller.multiDrawWithAnimation.bind(roller),
          multiDraw: roller.multiDraw.bind(roller),
          drawBatchNumbersWithAnimation: roller.drawBatchNumbersWithAnimation.bind(roller),
          drawBatchNumbers: roller.drawBatchNumbers.bind(roller),
          triggerCelebration: roller.triggerCelebration.bind(roller),
          handleFileData: roller.handleFileData.bind(roller),
          validateAndNavigate: roller.validateAndNavigate.bind(roller),
          goBack: roller.goBack.bind(roller),
          resetUsedNumbers: roller.resetUsedNumbers.bind(roller),
          clearHistory: roller.clearHistory.bind(roller),
          selectFile: roller.selectFile.bind(roller),
          handleFileUpload: roller.handleFileUpload.bind(roller),
          switchGroup: roller.switchGroup.bind(roller),
          addNewGroup: roller.addNewGroup.bind(roller),
          renameGroup: roller.renameGroup.bind(roller),
          deleteStudent: roller.deleteStudent.bind(roller),
          clearCurrentGroup: roller.clearCurrentGroup.bind(roller),
          saveGroups: roller.saveGroups.bind(roller),
          addRange: roller.addRange.bind(roller),
          removeRange: roller.removeRange.bind(roller),
          applyFontSettings: roller.applyFontSettings.bind(roller),
          adjustProbabilityRanges: roller.adjustProbabilityRanges.bind(roller),
          deleteGroup: roller.deleteGroup.bind(roller),
          // 新增：惊心动魄模式方法
          startTensionMode: roller.startTensionMode.bind(roller),
          // 新增：模式切换方法
          toggleFestivalMode: roller.toggleFestivalMode.bind(roller),
          toggleGenderMode: roller.toggleGenderMode.bind(roller),
          toggleRouletteMode: roller.toggleRouletteMode.bind(roller),
          toggleRoulette3DMode: roller.toggleRoulette3DMode.bind(roller),
          toggleFlipCardMode: roller.toggleFlipCardMode.bind(roller),
          togglePKMode: roller.togglePKMode.bind(roller),
          // 新增模态框方法
          showModalWithConfig: roller.showModalWithConfig.bind(roller),
          closeModal: roller.closeModal.bind(roller),
          showDeleteGroupModal: roller.showDeleteGroupModal.bind(roller),
          showClearGroupModal: roller.showClearGroupModal.bind(roller),
          showResetHistoryModal: roller.showResetHistoryModal.bind(roller),
          showClearHistoryModal: roller.showClearHistoryModal.bind(roller),
          showAddGroupModal: roller.showAddGroupModal.bind(roller),
          showRenameGroupModal: roller.showRenameGroupModal.bind(roller)
        };
      }
    }).mount('#app');
  } else {
    console.error('Vue 3 is required but not found. Please include Vue 3 in your HTML.');
  }
});
