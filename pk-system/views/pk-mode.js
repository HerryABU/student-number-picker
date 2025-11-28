/**
 * PK模式组件 - 支持男女生对战模式
 */

// Note: This import is handled dynamically to ensure true lazy loading

export class PKMode {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      namespace: options.namespace || 'pk-',
      autoStyleIsolation: options.autoStyleIsolation || false,
      ...options
    };
    
    this.state = {
     男生: [],
      女生: [],
      currentRound: 1,
     男生得分: 0,
      女生得分: 0,
      gameStarted: false,
      animationActive: false
    };
    
    this.init();
  }

  async init() {
    // 动态加载音频管理器
    const { globalAudioManager } = await import('../core/audio.js');
    this.audioManager = globalAudioManager;
    
    this.createDOM();
    this.setupEventListeners();
    this.applyStyles();
  }

  createDOM() {
    this.container.innerHTML = `
      <div id="${this.options.namespace}pk-container" class="${this.options.autoStyleIsolation ? this.options.namespace + 'pk-container' : 'pk-container'}">
        <div class="pk-header">
          <h2><i class="fas fa-swords"></i> PK对战模式</h2>
          <div class="score-board">
            <div class="score-team male-team">
              <div class="team-name">男生</div>
              <div class="team-score">${this.state.男生得分}</div>
            </div>
            <div class="vs-text">VS</div>
            <div class="score-team female-team">
              <div class="team-name">女生</div>
              <div class="team-score">${this.state.女生得分}</div>
            </div>
          </div>
        </div>

        <div class="pk-controls">
          <button id="${this.options.namespace}start-pk" class="btn btn-primary">
            <i class="fas fa-play"></i> 开始PK
          </button>
          <button id="${this.options.namespace}reset-pk" class="btn btn-secondary">
            <i class="fas fa-redo"></i> 重置
          </button>
        </div>

        <div class="sword-animation" id="${this.options.namespace}sword-animation">
          <div class="sword-cross">
            <div class="sword-hor"></div>
            <div class="sword-ver"></div>
          </div>
        </div>

        <div class="pk-players">
          <div class="player-section male-section">
            <h3><i class="fas fa-mars"></i> 男生</h3>
            <div class="player-list" id="${this.options.namespace}male-players"></div>
          </div>
          <div class="vs-center">
            <div class="sword-standby">
              <div class="sword-blade"></div>
              <div class="sword-hilt"></div>
            </div>
          </div>
          <div class="player-section female-section">
            <h3><i class="fas fa-venus"></i> 女生</h3>
            <div class="player-list" id="${this.options.namespace}female-players"></div>
          </div>
        </div>

        <div class="pk-result" id="${this.options.namespace}pk-result" style="display: none;">
          <div class="result-content">
            <h3>本轮结果</h3>
            <div class="result-players">
              <div class="result-player male-result">
                <div class="player-id">—</div>
                <div class="player-name">—</div>
              </div>
              <div class="vs-text">VS</div>
              <div class="result-player female-result">
                <div class="player-id">—</div>
                <div class="player-name">—</div>
              </div>
            </div>
            <div class="result-winner" id="${this.options.namespace}result-winner"></div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const startBtn = document.getElementById(`${this.options.namespace}start-pk`);
    const resetBtn = document.getElementById(`${this.options.namespace}reset-pk`);
    
    startBtn.addEventListener('click', () => this.startPK());
    resetBtn.addEventListener('click', () => this.reset());
  }

  applyStyles() {
    if (this.options.autoStyleIsolation) {
      // 如果启用样式隔离，添加特定的CSS
      const styleId = `${this.options.namespace}pk-styles`;
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .${this.options.namespace}pk-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          .${this.options.namespace}pk-container .pk-header {
            text-align: center;
            margin-bottom: 30px;
          }
          .${this.options.namespace}pk-container h2 {
            color: #2c3e50;
            margin: 0 0 20px 0;
          }
          .${this.options.namespace}pk-container .score-board {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 30px;
            margin-bottom: 20px;
          }
          .${this.options.namespace}pk-container .score-team {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 15px 30px;
            border-radius: 10px;
            min-width: 100px;
          }
          .${this.options.namespace}pk-container .male-team {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
          }
          .${this.options.namespace}pk-container .female-team {
            background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
            color: white;
          }
          .${this.options.namespace}pk-container .team-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .${this.options.namespace}pk-container .team-score {
            font-size: 36px;
            font-weight: bold;
          }
          .${this.options.namespace}pk-container .vs-text {
            font-size: 24px;
            font-weight: bold;
            color: #e74c3c;
          }
          .${this.options.namespace}pk-container .pk-controls {
            text-align: center;
            margin-bottom: 30px;
          }
          .${this.options.namespace}pk-container .btn {
            padding: 12px 24px;
            margin: 0 10px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s;
          }
          .${this.options.namespace}pk-container .btn-primary {
            background-color: #4361ee;
            color: white;
          }
          .${this.options.namespace}pk-container .btn-primary:hover {
            background-color: #3a56d4;
          }
          .${this.options.namespace}pk-container .btn-secondary {
            background-color: #6c757d;
            color: white;
          }
          .${this.options.namespace}pk-container .btn-secondary:hover {
            background-color: #5a6268;
          }
          .${this.options.namespace}pk-container .sword-animation {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
          }
          .${this.options.namespace}pk-container .sword-animation.active {
            opacity: 1;
            pointer-events: all;
          }
          .${this.options.namespace}pk-container .sword-cross {
            position: relative;
            width: 200px;
            height: 200px;
          }
          .${this.options.namespace}pk-container .sword-hor,
          .${this.options.namespace}pk-container .sword-ver {
            position: absolute;
            background: #ddd;
            border-radius: 5px;
          }
          .${this.options.namespace}pk-container .sword-hor {
            width: 200px;
            height: 10px;
            top: 95px;
          }
          .${this.options.namespace}pk-container .sword-ver {
            width: 10px;
            height: 200px;
            left: 95px;
          }
          .${this.options.namespace}pk-container .pk-players {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 30px;
          }
          .${this.options.namespace}pk-container .player-section {
            flex: 1;
            text-align: center;
          }
          .${this.options.namespace}pk-container .player-section h3 {
            margin-top: 0;
            color: #2c3e50;
          }
          .${this.options.namespace}pk-container .vs-center {
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
          }
          .${this.options.namespace}pk-container .sword-standby {
            position: relative;
            width: 60px;
            height: 120px;
          }
          .${this.options.namespace}pk-container .sword-blade {
            position: absolute;
            width: 4px;
            height: 80px;
            background: #e0e0e0;
            top: 0;
            left: 28px;
            border-radius: 2px 2px 0 0;
          }
          .${this.options.namespace}pk-container .sword-hilt {
            position: absolute;
            width: 30px;
            height: 10px;
            background: #8B4513;
            top: 80px;
            left: 15px;
            border-radius: 5px;
          }
          .${this.options.namespace}pk-container .player-list {
            min-height: 200px;
            border: 2px dashed #ddd;
            border-radius: 10px;
            padding: 10px;
            background: #f8f9fa;
          }
          .${this.options.namespace}pk-container .pk-result {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 10px;
            margin-top: 20px;
          }
          .${this.options.namespace}pk-container .result-players {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 30px;
            margin: 20px 0;
          }
          .${this.options.namespace}pk-container .result-player {
            text-align: center;
            padding: 15px;
            border-radius: 10px;
            min-width: 120px;
          }
          .${this.options.namespace}pk-container .male-result {
            background: #4facfe;
            color: white;
          }
          .${this.options.namespace}pk-container .female-result {
            background: #ff9a9e;
            color: white;
          }
          .${this.options.namespace}pk-container .result-winner {
            font-size: 24px;
            font-weight: bold;
            margin-top: 20px;
            padding: 10px;
            border-radius: 5px;
          }
          .${this.options.namespace}pk-container .winner-male {
            background: #4facfe;
            color: white;
          }
          .${this.options.namespace}pk-container .winner-female {
            background: #ff9a9e;
            color: white;
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      // 全局样式
      const styleId = 'pk-global-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .pk-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          .pk-container .pk-header {
            text-align: center;
            margin-bottom: 30px;
          }
          .pk-container h2 {
            color: #2c3e50;
            margin: 0 0 20px 0;
          }
          .pk-container .score-board {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 30px;
            margin-bottom: 20px;
          }
          .pk-container .score-team {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 15px 30px;
            border-radius: 10px;
            min-width: 100px;
          }
          .pk-container .male-team {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
          }
          .pk-container .female-team {
            background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
            color: white;
          }
          .pk-container .team-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .pk-container .team-score {
            font-size: 36px;
            font-weight: bold;
          }
          .pk-container .vs-text {
            font-size: 24px;
            font-weight: bold;
            color: #e74c3c;
          }
          .pk-container .pk-controls {
            text-align: center;
            margin-bottom: 30px;
          }
          .pk-container .btn {
            padding: 12px 24px;
            margin: 0 10px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s;
          }
          .pk-container .btn-primary {
            background-color: #4361ee;
            color: white;
          }
          .pk-container .btn-primary:hover {
            background-color: #3a56d4;
          }
          .pk-container .btn-secondary {
            background-color: #6c757d;
            color: white;
          }
          .pk-container .btn-secondary:hover {
            background-color: #5a6268;
          }
          .pk-container .sword-animation {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
          }
          .pk-container .sword-animation.active {
            opacity: 1;
            pointer-events: all;
          }
          .pk-container .sword-cross {
            position: relative;
            width: 200px;
            height: 200px;
          }
          .pk-container .sword-hor,
          .pk-container .sword-ver {
            position: absolute;
            background: #ddd;
            border-radius: 5px;
          }
          .pk-container .sword-hor {
            width: 200px;
            height: 10px;
            top: 95px;
          }
          .pk-container .sword-ver {
            width: 10px;
            height: 200px;
            left: 95px;
          }
          .pk-container .pk-players {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 30px;
          }
          .pk-container .player-section {
            flex: 1;
            text-align: center;
          }
          .pk-container .player-section h3 {
            margin-top: 0;
            color: #2c3e50;
          }
          .pk-container .vs-center {
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
          }
          .pk-container .sword-standby {
            position: relative;
            width: 60px;
            height: 120px;
          }
          .pk-container .sword-blade {
            position: absolute;
            width: 4px;
            height: 80px;
            background: #e0e0e0;
            top: 0;
            left: 28px;
            border-radius: 2px 2px 0 0;
          }
          .pk-container .sword-hilt {
            position: absolute;
            width: 30px;
            height: 10px;
            background: #8B4513;
            top: 80px;
            left: 15px;
            border-radius: 5px;
          }
          .pk-container .player-list {
            min-height: 200px;
            border: 2px dashed #ddd;
            border-radius: 10px;
            padding: 10px;
            background: #f8f9fa;
          }
          .pk-container .pk-result {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 10px;
            margin-top: 20px;
          }
          .pk-container .result-players {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 30px;
            margin: 20px 0;
          }
          .pk-container .result-player {
            text-align: center;
            padding: 15px;
            border-radius: 10px;
            min-width: 120px;
          }
          .pk-container .male-result {
            background: #4facfe;
            color: white;
          }
          .pk-container .female-result {
            background: #ff9a9e;
            color: white;
          }
          .pk-container .result-winner {
            font-size: 24px;
            font-weight: bold;
            margin-top: 20px;
            padding: 10px;
            border-radius: 5px;
          }
          .pk-container .winner-male {
            background: #4facfe;
            color: white;
          }
          .pk-container .winner-female {
            background: #ff9a9e;
            color: white;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }

  async startPK() {
    if (this.state.animationActive) return;
    
    // 播放击剑音效
    await this.audioManager.playSystemSound('sword');
    
    // 显示击剑动画
    this.showSwordAnimation();
    
    // 模拟动画持续时间
    setTimeout(() => {
      this.executePK();
    }, 1500);
  }

  showSwordAnimation() {
    this.state.animationActive = true;
    const animationEl = document.getElementById(`${this.options.namespace}sword-animation`);
    animationEl.classList.add('active');
    
    // 添加动画效果
    const swordHor = animationEl.querySelector('.sword-hor');
    const swordVer = animationEl.querySelector('.sword-ver');
    
    swordHor.style.transform = 'rotate(45deg)';
    swordVer.style.transform = 'rotate(45deg)';
    
    setTimeout(() => {
      swordHor.style.transform = 'rotate(0deg)';
      swordVer.style.transform = 'rotate(0deg)';
      
      setTimeout(() => {
        animationEl.classList.remove('active');
        this.state.animationActive = false;
      }, 300);
    }, 1000);
  }

  executePK() {
    // 随机选择男生和女生
    const malePlayers = this.state.男生.filter(p => !p.used);
    const femalePlayers = this.state.女生.filter(p => !p.used);
    
    if (malePlayers.length === 0 || femalePlayers.length === 0) {
      alert('没有足够的未使用玩家进行PK！');
      return;
    }
    
    const maleIndex = Math.floor(Math.random() * malePlayers.length);
    const femaleIndex = Math.floor(Math.random() * femalePlayers.length);
    
    const selectedMale = malePlayers[maleIndex];
    const selectedFemale = femalePlayers[femaleIndex];
    
    // 标记为已使用
    selectedMale.used = true;
    selectedFemale.used = true;
    
    // 显示结果
    this.showPKResult(selectedMale, selectedFemale);
    
    // 随机决定胜者
    const winner = Math.random() > 0.5 ? 'male' : 'female';
    this.updateScore(winner);
    
    // 播放抽取音效
    this.audioManager.playSystemSound('draw');
  }

  showPKResult(male, female) {
    const resultEl = document.getElementById(`${this.options.namespace}pk-result`);
    const maleResult = resultEl.querySelector('.male-result');
    const femaleResult = resultEl.querySelector('.female-result');
    const winnerEl = document.getElementById(`${this.options.namespace}result-winner`);
    
    maleResult.querySelector('.player-id').textContent = male.student_id;
    maleResult.querySelector('.player-name').textContent = male.name || '';
    
    femaleResult.querySelector('.player-id').textContent = female.student_id;
    femaleResult.querySelector('.player-name').textContent = female.name || '';
    
    resultEl.style.display = 'block';
  }

  updateScore(winner) {
    if (winner === 'male') {
      this.state.男生得分++;
      document.querySelector('.male-team .team-score').textContent = this.state.男生得分;
    } else {
      this.state.女生得分++;
      document.querySelector('.female-team .team-score').textContent = this.state.女生得分;
    }
  }

  reset() {
    // 重置状态
    this.state.男生.forEach(p => p.used = false);
    this.state.女生.forEach(p => p.used = false);
    this.state.男生得分 = 0;
    this.state.女生得分 = 0;
    this.state.currentRound = 1;
    
    // 更新UI
    document.querySelector('.male-team .team-score').textContent = '0';
    document.querySelector('.female-team .team-score').textContent = '0';
    
    // 隐藏结果
    const resultEl = document.getElementById(`${this.options.namespace}pk-result`);
    resultEl.style.display = 'none';
    
    // 重置玩家列表显示
    this.renderPlayerLists();
    
    this.audioManager.playSystemSound('click');
  }

  renderPlayerLists() {
    const maleList = document.getElementById(`${this.options.namespace}male-players`);
    const femaleList = document.getElementById(`${this.options.namespace}female-players`);
    
    maleList.innerHTML = this.state.男生.map(p => `
      <div class="player-item ${p.used ? 'used' : ''}">
        <div class="player-id">${p.student_id}</div>
        <div class="player-name">${p.name || ''}</div>
      </div>
    `).join('');
    
    femaleList.innerHTML = this.state.女生.map(p => `
      <div class="player-item ${p.used ? 'used' : ''}">
        <div class="player-id">${p.student_id}</div>
        <div class="player-name">${p.name || ''}</div>
      </div>
    `).join('');
  }

  // 设置玩家数据
  setPlayers(malePlayers, femalePlayers) {
    this.state.男生 = malePlayers.map(p => ({ ...p, used: false }));
    this.state.女生 = femalePlayers.map(p => ({ ...p, used: false }));
    
    this.renderPlayerLists();
  }

  // 销毁组件
  destroy() {
    const container = document.getElementById(`${this.options.namespace}pk-container`);
    if (container) {
      container.remove();
    }
    
    // 移除样式
    if (this.options.autoStyleIsolation) {
      const style = document.getElementById(`${this.options.namespace}pk-styles`);
      if (style) style.remove();
    } else {
      const style = document.getElementById('pk-global-styles');
      if (style) style.remove();
    }
  }
}