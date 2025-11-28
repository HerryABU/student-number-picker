/**
 * NB抽学号系统 - 主应用
 */
import AudioManager from '../core/audio.js';
import PersistenceManager from '../core/persistence.js';
import XLSXLoader from '../lib/xlsx-loader.js';
import PKMode from './pk-mode.js';
import RouletteMode from './roulette-mode.js';

class NBRollerApp {
  constructor() {
    this.audioManager = new AudioManager();
    this.persistence = new PersistenceManager();
    this.xlsxLoader = new XLSXLoader();
    
    // 学生数据
    this.students = [];
    this.maleStudents = [];
    this.femaleStudents = [];
    this.availableStudents = [];
    this.history = [];
    
    // 状态
    this.currentMode = 'normal';
    this.isDrawing = false;
    this.drawInterval = null;
    this.currentNumber = null;
    this.currentStudent = null;
    
    // 组件实例
    this.pkMode = null;
    this.rouletteMode = null;
    
    this.init();
  }

  async init() {
    // 加载保存的数据
    this.loadSavedData();
    
    // 绑定事件
    this.bindEvents();
    
    // 初始化界面
    this.updateUI();
    
    // 恢复音频上下文
    this.audioManager.resumeContext();
  }

  // 加载保存的数据
  loadSavedData() {
    this.students = this.persistence.loadStudents();
    this.history = this.persistence.loadHistory();
    
    // 根据性别分组
    this.groupStudentsByGender();
    
    // 加载设置
    const settings = this.persistence.loadSettings();
    this.currentMode = settings.currentMode || 'normal';
    
    // 更新音频设置
    this.audioManager.setEnabled(settings.audioEnabled);
    this.audioManager.setTTSEnabled(settings.ttsEnabled);
    
    // 应用节日主题
    this.applyFestivalTheme(settings.festivalTheme);
    
    // 更新历史记录显示
    this.updateHistoryDisplay();
  }

  // 根据性别分组学生
  groupStudentsByGender() {
    this.maleStudents = this.students.filter(s => s.gender === 'male');
    this.femaleStudents = this.students.filter(s => s.gender === 'female');
    this.availableStudents = [...this.students];
  }

  // 绑定事件
  bindEvents() {
    // 模式切换
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.target.dataset.mode;
        this.switchMode(mode);
      });
    });
    
    // 标准模式按钮
    document.getElementById('start-btn')?.addEventListener('click', () => this.startDraw());
    document.getElementById('stop-btn')?.addEventListener('click', () => this.stopDraw());
    document.getElementById('reset-btn')?.addEventListener('click', () => this.reset());
    
    // 男女生模式按钮
    document.getElementById('gender-start-btn')?.addEventListener('click', () => this.startGenderDraw());
    document.getElementById('gender-stop-btn')?.addEventListener('click', () => this.stopGenderDraw());
    document.getElementById('gender-reset-btn')?.addEventListener('click', () => this.resetGenderMode());
    
    // 音效控制
    const audioToggle = document.getElementById('audio-enabled');
    const ttsToggle = document.getElementById('tts-enabled');
    
    if (audioToggle) {
      audioToggle.checked = this.audioManager.enabled;
      audioToggle.addEventListener('change', (e) => {
        this.audioManager.setEnabled(e.target.checked);
        this.saveSettings();
      });
    }
    
    if (ttsToggle) {
      ttsToggle.checked = this.audioManager.ttsEnabled;
      ttsToggle.addEventListener('change', (e) => {
        this.audioManager.setTTSEnabled(e.target.checked);
        this.saveSettings();
      });
    }
    
    // 设置按钮
    document.getElementById('settings-btn')?.addEventListener('click', () => this.showSettings());
    document.getElementById('import-btn')?.addEventListener('click', () => this.showImportModal());
    document.getElementById('festival-theme-btn')?.addEventListener('click', () => this.showFestivalThemeModal());
    
    // 清空历史
    document.getElementById('clear-history-btn')?.addEventListener('click', () => this.clearHistory());
    
    // 监听自定义事件
    document.addEventListener('playClickSound', () => this.audioManager.playClick());
    document.addEventListener('playDrawSound', () => this.audioManager.playDraw());
    document.addEventListener('playCelebrateSound', () => this.audioManager.playCelebrate());
    document.addEventListener('playFencingSound', () => this.audioManager.playFencing());
    document.addEventListener('playRouletteSound', () => this.audioManager.playRoulette());
    document.addEventListener('playFlipSound', () => this.audioManager.playFlip());
    
    // PK模式结果事件
    document.addEventListener('pkResult', (e) => {
      this.handlePKResult(e.detail);
    });
    
    // 转盘结果事件
    document.addEventListener('rouletteResult', (e) => {
      this.handleRouletteResult(e.detail);
    });
  }

  // 切换模式
  switchMode(mode) {
    this.currentMode = mode;
    
    // 更新按钮状态
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // 显示对应模式的界面
    document.querySelectorAll('.display-section').forEach(section => {
      section.classList.toggle('active', section.id === `${mode}-display`);
    });
    
    // 保存设置
    this.saveSettings();
    
    // 播放切换音效
    this.audioManager.playClick();
  }

  // 开始抽取（标准模式）
  startDraw() {
    if (this.isDrawing) return;
    
    this.isDrawing = true;
    document.getElementById('start-btn').disabled = true;
    document.getElementById('stop-btn').disabled = false;
    
    // 播放开始音效
    this.audioManager.playClick();
    
    // 开始快速滚动
    this.drawInterval = setInterval(() => {
      this.randomDraw();
    }, 100);
  }

  // 停止抽取（标准模式）
  stopDraw() {
    if (!this.isDrawing) return;
    
    this.isDrawing = false;
    if (this.drawInterval) {
      clearInterval(this.drawInterval);
      this.drawInterval = null;
    }
    
    document.getElementById('start-btn').disabled = false;
    document.getElementById('stop-btn').disabled = true;
    
    // 确定最终结果
    this.finalizeDraw();
  }

  // 随机抽取（标准模式）
  randomDraw() {
    if (this.availableStudents.length === 0) {
      this.showMessage('没有可抽取的学生！');
      this.stopDraw();
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * this.availableStudents.length);
    const student = this.availableStudents[randomIndex];
    
    this.currentNumber = student.id;
    this.currentStudent = student;
    
    this.updateDisplay(student);
  }

  // 确定抽取结果（标准模式）
  finalizeDraw() {
    if (!this.currentStudent) {
      this.randomDraw(); // 如果没有当前学生，随机选一个
    }
    
    if (this.currentStudent) {
      // 添加到历史记录
      this.addToHistory(this.currentStudent);
      
      // 播放庆祝音效
      this.audioManager.playCelebrate();
      
      // 播放名字
      if (this.audioManager.ttsEnabled) {
        this.audioManager.speak(this.currentStudent.name);
      }
      
      // 播放抽取音效
      this.audioManager.playDraw();
    }
  }

  // 开始男女生模式抽取
  startGenderDraw() {
    if (this.isDrawing) return;
    
    const genderSelect = document.getElementById('gender-select');
    const selectedGender = genderSelect ? genderSelect.value : 'all';
    
    let availableStudents = this.availableStudents;
    if (selectedGender === 'male') {
      availableStudents = this.maleStudents;
    } else if (selectedGender === 'female') {
      availableStudents = this.femaleStudents;
    }
    
    if (availableStudents.length === 0) {
      this.showMessage('没有可抽取的学生！');
      return;
    }
    
    this.isDrawing = true;
    document.getElementById('gender-start-btn').disabled = true;
    document.getElementById('gender-stop-btn').disabled = true;
    
    // 播放开始音效
    this.audioManager.playClick();
    
    // 开始快速滚动
    this.drawInterval = setInterval(() => {
      this.randomGenderDraw(availableStudents);
    }, 100);
  }

  // 随机抽取（男女生模式）
  randomGenderDraw(availableStudents) {
    if (availableStudents.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * availableStudents.length);
    const student = availableStudents[randomIndex];
    
    this.currentNumber = student.id;
    this.currentStudent = student;
    
    // 更新男女生模式显示
    document.getElementById('gender-current-number').textContent = student.id;
    document.getElementById('gender-current-name').textContent = student.name;
  }

  // 停止男女生模式抽取
  stopGenderDraw() {
    if (!this.isDrawing) return;
    
    this.isDrawing = false;
    if (this.drawInterval) {
      clearInterval(this.drawInterval);
      this.drawInterval = null;
    }
    
    document.getElementById('gender-start-btn').disabled = false;
    document.getElementById('gender-stop-btn').disabled = false;
    
    // 确定最终结果
    this.finalizeGenderDraw();
  }

  // 确定男女生模式抽取结果
  finalizeGenderDraw() {
    if (!this.currentStudent) {
      const genderSelect = document.getElementById('gender-select');
      const selectedGender = genderSelect ? genderSelect.value : 'all';
      
      let availableStudents = this.availableStudents;
      if (selectedGender === 'male') {
        availableStudents = this.maleStudents;
      } else if (selectedGender === 'female') {
        availableStudents = this.femaleStudents;
      }
      
      if (availableStudents.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableStudents.length);
        this.currentStudent = availableStudents[randomIndex];
      }
    }
    
    if (this.currentStudent) {
      // 添加到历史记录
      this.addToHistory(this.currentStudent);
      
      // 更新显示
      document.getElementById('gender-current-number').textContent = this.currentStudent.id;
      document.getElementById('gender-current-name').textContent = this.currentStudent.name;
      
      // 播放庆祝音效
      this.audioManager.playCelebrate();
      
      // 播放名字
      if (this.audioManager.ttsEnabled) {
        this.audioManager.speak(this.currentStudent.name);
      }
      
      // 播放抽取音效
      this.audioManager.playDraw();
    }
  }

  // 重置
  reset() {
    this.availableStudents = [...this.students];
    this.currentNumber = null;
    this.currentStudent = null;
    
    if (this.isDrawing) {
      this.stopDraw();
    }
    
    document.getElementById('current-number').textContent = '--';
    document.getElementById('current-name').textContent = '等待抽取';
  }

  // 重置男女生模式
  resetGenderMode() {
    this.availableStudents = [...this.students];
    this.currentNumber = null;
    this.currentStudent = null;
    
    if (this.isDrawing) {
      this.stopGenderDraw();
    }
    
    document.getElementById('gender-current-number').textContent = '--';
    document.getElementById('gender-current-name').textContent = '等待抽取';
  }

  // 更新显示
  updateDisplay(student) {
    if (student) {
      document.getElementById('current-number').textContent = student.id;
      document.getElementById('current-name').textContent = student.name;
    }
  }

  // 添加到历史记录
  addToHistory(student) {
    const record = {
      id: student.id,
      name: student.name,
      gender: student.gender,
      timestamp: new Date().toLocaleString(),
      mode: this.currentMode
    };
    
    this.history.unshift(record);
    
    // 限制历史记录数量
    if (this.history.length > 50) {
      this.history = this.history.slice(0, 50);
    }
    
    this.updateHistoryDisplay();
    this.saveHistory();
  }

  // 更新历史记录显示
  updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    historyList.innerHTML = this.history.slice(0, 10).map(record => `
      <div class="history-item">
        <span class="number">${record.id}</span>
        <span class="name">${record.name}</span>
        <span class="time">${record.timestamp}</span>
      </div>
    `).join('');
  }

  // 保存历史记录
  saveHistory() {
    this.persistence.saveHistory(this.history);
  }

  // 保存设置
  saveSettings() {
    const settings = {
      audioEnabled: this.audioManager.enabled,
      ttsEnabled: this.audioManager.ttsEnabled,
      currentMode: this.currentMode,
      festivalTheme: document.body.className.match(/(\w+)-theme/)?.[1] || ''
    };
    
    this.persistence.saveSettings(settings);
  }

  // 清空历史记录
  clearHistory() {
    if (confirm('确定要清空所有历史记录吗？')) {
      this.history = [];
      this.updateHistoryDisplay();
      this.persistence.remove('history');
    }
  }

  // 显示消息
  showMessage(message) {
    alert(message);
  }

  // 显示设置模态框
  showSettings() {
    const modalBody = document.getElementById('modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <h3>系统设置</h3>
        <div class="setting-item">
          <label>
            <input type="checkbox" id="setting-audio" ${this.audioManager.enabled ? 'checked' : ''}>
            启用音效
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input type="checkbox" id="setting-tts" ${this.audioManager.ttsEnabled ? 'checked' : ''}>
            启用名字播报
          </label>
        </div>
        <div class="setting-item">
          <label>当前学生数: ${this.students.length}</label>
        </div>
        <div class="setting-item">
          <label>男生数: ${this.maleStudents.length}</label>
        </div>
        <div class="setting-item">
          <label>女生数: ${this.femaleStudents.length}</label>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary close-modal">关闭</button>
        </div>
      `;
      
      // 绑定设置事件
      const audioSetting = document.getElementById('setting-audio');
      const ttsSetting = document.getElementById('setting-tts');
      
      audioSetting?.addEventListener('change', (e) => {
        this.audioManager.setEnabled(e.target.checked);
      });
      
      ttsSetting?.addEventListener('change', (e) => {
        this.audioManager.setTTSEnabled(e.target.checked);
      });
      
      // 关闭按钮事件
      document.querySelector('.close-modal')?.addEventListener('click', () => {
        this.hideModal();
        this.saveSettings();
      });
    }
    
    this.showModal();
  }

  // 显示导入模态框
  async showImportModal() {
    const modalBody = document.getElementById('modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <h3>导入学生名单</h3>
        <div class="import-controls">
          <p>支持Excel文件(.xlsx, .xls)和CSV文件</p>
          <p>格式：学号, 姓名, 性别 (性别列可选)</p>
          <input type="file" id="file-input" accept=".xlsx,.xls,.csv" style="margin: 15px 0;">
          <div class="file-info" id="file-info"></div>
          <div class="import-preview" id="import-preview" style="max-height: 200px; overflow-y: auto; margin: 15px 0; display: none;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" id="import-confirm-btn" disabled>导入</button>
          <button class="btn btn-secondary close-modal">取消</button>
        </div>
      `;
      
      const fileInput = document.getElementById('file-input');
      fileInput?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!this.xlsxLoader.validateFile(file)) {
          document.getElementById('file-info').innerHTML = '<span style="color: red;">不支持的文件格式</span>';
          document.getElementById('import-confirm-btn').disabled = true;
          return;
        }
        
        try {
          document.getElementById('file-info').textContent = `正在读取文件: ${file.name}`;
          
          const students = await this.xlsxLoader.readExcel(file);
          document.getElementById('file-info').innerHTML = `<span style="color: green;">读取成功，共${students.length}名学生</span>`;
          
          // 显示预览
          const previewDiv = document.getElementById('import-preview');
          if (previewDiv) {
            previewDiv.innerHTML = `
              <h4>预览前5条数据：</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f0f0f0;">
                    <th style="border: 1px solid #ddd; padding: 8px;">学号</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">姓名</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">性别</th>
                  </tr>
                </thead>
                <tbody>
                  ${students.slice(0, 5).map(student => `
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 8px;">${student.id}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">${student.name}</td>
                      <td style="border: 1px solid #ddd; padding: 8px;">${student.gender}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `;
            previewDiv.style.display = 'block';
          }
          
          document.getElementById('import-confirm-btn').disabled = false;
          
          // 保存临时数据供确认使用
          this.tempStudents = students;
        } catch (error) {
          document.getElementById('file-info').innerHTML = `<span style="color: red;">读取失败: ${error.message}</span>`;
          document.getElementById('import-confirm-btn').disabled = true;
        }
      });
      
      // 导入确认按钮
      document.getElementById('import-confirm-btn')?.addEventListener('click', () => {
        if (this.tempStudents) {
          this.importStudents(this.tempStudents);
          this.tempStudents = null;
          this.hideModal();
        }
      });
      
      // 关闭按钮事件
      document.querySelector('.close-modal')?.addEventListener('click', () => {
        this.hideModal();
      });
    }
    
    this.showModal();
  }

  // 导入学生
  importStudents(students) {
    this.students = students;
    this.groupStudentsByGender();
    this.availableStudents = [...this.students];
    
    // 保存到持久化存储
    this.persistence.saveStudents(this.students);
    
    this.showMessage(`成功导入${students.length}名学生！`);
    this.updateUI();
  }

  // 显示节日主题模态框
  showFestivalThemeModal() {
    const themes = [
      { value: '', name: '默认主题' },
      { value: 'spring', name: '春节主题' },
      { value: 'christmas', name: '圣诞节主题' },
      { value: 'valentine', name: '情人节主题' },
      { value: 'halloween', name: '万圣节主题' }
    ];
    
    const currentTheme = document.body.className.match(/(\w+)-theme/)?.[1] || '';
    
    const modalBody = document.getElementById('modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <h3>选择节日主题</h3>
        <div class="theme-selector">
          ${themes.map(theme => `
            <div class="theme-option" style="margin: 10px 0; cursor: pointer; padding: 10px; border: 2px solid ${currentTheme === theme.value ? '#007bff' : 'transparent'}; border-radius: 5px;">
              <label style="display: flex; align-items: center; cursor: pointer;">
                <input type="radio" name="festival-theme" value="${theme.value}" ${currentTheme === theme.value ? 'checked' : ''} style="margin-right: 10px;">
                ${theme.name}
              </label>
            </div>
          `).join('')}
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary apply-theme-btn">应用</button>
          <button class="btn btn-secondary close-modal">取消</button>
        </div>
      `;
      
      // 应用主题按钮
      document.querySelector('.apply-theme-btn')?.addEventListener('click', () => {
        const selectedTheme = document.querySelector('input[name="festival-theme"]:checked').value;
        this.applyFestivalTheme(selectedTheme);
        this.hideModal();
      });
      
      // 关闭按钮事件
      document.querySelector('.close-modal')?.addEventListener('click', () => {
        this.hideModal();
      });
    }
    
    this.showModal();
  }

  // 应用节日主题
  applyFestivalTheme(theme) {
    // 移除所有主题类
    document.body.className = document.body.className.replace(/\w+-theme/g, '');
    
    // 添加新主题类
    if (theme) {
      document.body.classList.add(`${theme}-theme`);
    }
    
    // 添加节日装饰
    this.addFestivalDecorations(theme);
    
    // 保存设置
    this.saveSettings();
  }

  // 添加节日装饰
  addFestivalDecorations(theme) {
    const decorationsContainer = document.getElementById('festival-decorations');
    if (!decorationsContainer) return;
    
    // 清空现有装饰
    decorationsContainer.innerHTML = '';
    
    // 根据主题添加装饰
    switch(theme) {
      case 'spring':
        this.addSpringDecorations(decorationsContainer);
        break;
      case 'christmas':
        this.addChristmasDecorations(decorationsContainer);
        break;
      case 'valentine':
        this.addValentineDecorations(decorationsContainer);
        break;
      case 'halloween':
        this.addHalloweenDecorations(decorationsContainer);
        break;
    }
  }

  // 添加春节装饰
  addSpringDecorations(container) {
    for (let i = 0; i < 5; i++) {
      const lantern = document.createElement('div');
      lantern.className = 'spring-lantern';
      lantern.style.left = `${Math.random() * 100}%`;
      lantern.style.top = `${Math.random() * 100}%`;
      lantern.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(lantern);
    }
    
    for (let i = 0; i < 10; i++) {
      const firecracker = document.createElement('div');
      firecracker.className = 'spring-firecracker';
      firecracker.textContent = '炮';
      firecracker.style.left = `${Math.random() * 100}%`;
      firecracker.style.top = `${Math.random() * 100}%`;
      firecracker.style.animationDelay = `${Math.random() * 3}s`;
      container.appendChild(firecracker);
    }
  }

  // 添加圣诞节装饰
  addChristmasDecorations(container) {
    for (let i = 0; i < 8; i++) {
      const deco = document.createElement('div');
      deco.className = 'christmas-deco';
      deco.textContent = i % 2 === 0 ? '🎄' : '🎁';
      deco.style.left = `${Math.random() * 100}%`;
      deco.style.top = `${Math.random() * 100}%`;
      deco.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(deco);
    }
    
    for (let i = 0; i < 15; i++) {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      snowflake.textContent = '❄';
      snowflake.style.left = `${Math.random() * 100}%`;
      snowflake.style.top = `${-Math.random() * 20}%`;
      snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;
      snowflake.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(snowflake);
    }
  }

  // 添加情人节装饰
  addValentineDecorations(container) {
    for (let i = 0; i < 12; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart-deco';
      heart.textContent = '❤';
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.top = `${Math.random() * 100}%`;
      heart.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(heart);
    }
  }

  // 添加万圣节装饰
  addHalloweenDecorations(container) {
    for (let i = 0; i < 8; i++) {
      const deco = document.createElement('div');
      deco.className = 'halloween-deco';
      const symbols = ['🎃', '👻', '🕷', '🕸', '🦇', '🔮'];
      deco.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      deco.style.left = `${Math.random() * 100}%`;
      deco.style.top = `${Math.random() * 100}%`;
      deco.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(deco);
    }
  }

  // 处理PK结果
  handlePKResult(detail) {
    // 添加到历史记录
    const record = {
      id: 'PK',
      name: `${detail.male.name} VS ${detail.female.name}`,
      gender: 'pk',
      timestamp: new Date().toLocaleString(),
      mode: 'pk',
      detail: detail
    };
    
    this.history.unshift(record);
    this.updateHistoryDisplay();
    this.saveHistory();
    
    // 播放庆祝音效
    this.audioManager.playCelebrate();
  }

  // 处理转盘结果
  handleRouletteResult(detail) {
    // 添加到历史记录
    const record = {
      id: detail.player.id,
      name: detail.player.name,
      gender: detail.player.gender,
      timestamp: new Date().toLocaleString(),
      mode: detail.type
    };
    
    this.history.unshift(record);
    this.updateHistoryDisplay();
    this.saveHistory();
    
    // 播放庆祝音效
    this.audioManager.playCelebrate();
    
    // 播放名字
    if (this.audioManager.ttsEnabled) {
      this.audioManager.speak(detail.player.name);
    }
  }

  // 显示模态框
  showModal() {
    const modal = document.getElementById('modal');
    if (modal) {
      modal.style.display = 'flex';
      
      // 绑定关闭事件
      modal.querySelector('.close')?.addEventListener('click', () => this.hideModal());
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.hideModal();
      });
    }
  }

  // 隐藏模态框
  hideModal() {
    const modal = document.getElementById('modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // 更新UI
  updateUI() {
    // 更新学生统计信息
    document.querySelectorAll('.male-count, .female-count, .total-count').forEach(el => {
      const cls = el.className;
      if (cls.includes('male-count')) {
        el.textContent = this.maleStudents.length;
      } else if (cls.includes('female-count')) {
        el.textContent = this.femaleStudents.length;
      } else if (cls.includes('total-count')) {
        el.textContent = this.students.length;
      }
    });
  }

  // 销毁应用
  destroy() {
    if (this.drawInterval) {
      clearInterval(this.drawInterval);
    }
    
    this.audioManager.destroy();
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  window.nbRollerApp = new NBRollerApp();
});

// 导出应用类（如果需要在其他地方使用）
export default NBRollerApp;