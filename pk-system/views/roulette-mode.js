/**
 * 转盘抽取模式组件 - 支持平面圆形和立体侧面环形+翻卡片两种模式
 */

// Note: This import is handled dynamically to ensure true lazy loading

export class RouletteMode {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      namespace: options.namespace || 'roulette-',
      autoStyleIsolation: options.autoStyleIsolation || false,
      ...options
    };
    
    this.state = {
      players: [],
      currentMode: 'flat', // 'flat' 或 '3d'
      isSpinning: false,
      currentResult: null,
      rotation: 0
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
      <div id="${this.options.namespace}roulette-container" class="${this.options.autoStyleIsolation ? this.options.namespace + 'roulette-container' : 'roulette-container'}">
        <div class="roulette-header">
          <h2><i class="fas fa-dharmachakra"></i> 转盘抽取模式</h2>
          <div class="mode-selector">
            <button id="${this.options.namespace}flat-mode" class="mode-btn active" data-mode="flat">
              <i class="fas fa-circle"></i> 平面圆形
            </button>
            <button id="${this.options.namespace}3d-mode" class="mode-btn" data-mode="3d">
              <i class="fas fa-cube"></i> 3D环形
            </button>
          </div>
        </div>

        <div class="roulette-area">
          <div class="roulette-wheel-container">
            <div id="${this.options.namespace}roulette-wheel" class="roulette-wheel">
              <!-- 转盘内容将动态生成 -->
              <div class="wheel-center">
                <div class="pointer"></div>
              </div>
            </div>
          </div>

          <div class="card-display" id="${this.options.namespace}card-display" style="display: none;">
            <div class="card">
              <div class="card-front">
                <div class="card-content">
                  <div class="player-id">—</div>
                  <div class="player-name">—</div>
                </div>
              </div>
              <div class="card-back">
                <div class="card-back-content">
                  <i class="fas fa-user-secret"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="roulette-controls">
          <button id="${this.options.namespace}spin-btn" class="btn btn-primary">
            <i class="fas fa-play"></i> 开始转动
          </button>
          <button id="${this.options.namespace}reset-btn" class="btn btn-secondary">
            <i class="fas fa-redo"></i> 重置
          </button>
        </div>

        <div class="result-display" id="${this.options.namespace}result-display" style="display: none;">
          <h3>抽取结果</h3>
          <div class="result-content">
            <div class="result-player">
              <div class="player-id">—</div>
              <div class="player-name">—</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const flatModeBtn = document.getElementById(`${this.options.namespace}flat-mode`);
    const threeDModeBtn = document.getElementById(`${this.options.namespace}3d-mode`);
    const spinBtn = document.getElementById(`${this.options.namespace}spin-btn`);
    const resetBtn = document.getElementById(`${this.options.namespace}reset-btn`);
    
    flatModeBtn.addEventListener('click', () => this.switchMode('flat'));
    threeDModeBtn.addEventListener('click', () => this.switchMode('3d'));
    spinBtn.addEventListener('click', () => this.spin());
    resetBtn.addEventListener('click', () => this.reset());
  }

  applyStyles() {
    if (this.options.autoStyleIsolation) {
      // 如果启用样式隔离，添加特定的CSS
      const styleId = `${this.options.namespace}roulette-styles`;
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .${this.options.namespace}roulette-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .${this.options.namespace}roulette-container .roulette-header {
            margin-bottom: 30px;
          }
          .${this.options.namespace}roulette-container h2 {
            color: #2c3e50;
            margin: 0 0 20px 0;
          }
          .${this.options.namespace}roulette-container .mode-selector {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
          }
          .${this.options.namespace}roulette-container .mode-btn {
            padding: 10px 20px;
            border: 2px solid #ddd;
            background: white;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
          }
          .${this.options.namespace}roulette-container .mode-btn.active {
            background: #4361ee;
            color: white;
            border-color: #4361ee;
          }
          .${this.options.namespace}roulette-container .mode-btn:hover {
            border-color: #4361ee;
          }
          .${this.options.namespace}roulette-container .roulette-area {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 50px;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .${this.options.namespace}roulette-container .roulette-wheel-container {
            position: relative;
            display: inline-block;
          }
          .${this.options.namespace}roulette-container .roulette-wheel {
            width: 300px;
            height: 300px;
            border-radius: 50%;
            position: relative;
            overflow: hidden;
            border: 5px solid #34495e;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transition: transform 4s cubic-bezier(0.17, 0.67, 0.83, 0.67);
          }
          .${this.options.namespace}roulette-container .roulette-wheel.flat-mode {
            background: conic-gradient(
              #ff9a9e 0deg, #fecfef 15deg, #fecfef 30deg, #a1c4fd 45deg,
              #a1c4fd 60deg, #c2e9fb 75deg, #c2e9fb 90deg, #d4fc79 105deg,
              #d4fc79 120deg, #96e6a1 135deg, #96e6a1 150deg, #fbc2eb 165deg,
              #fbc2eb 180deg, #a6c1ee 195deg, #a6c1ee 210deg, #f6d365 225deg,
              #f6d365 240deg, #fda085 255deg, #fda085 270deg, #84fab0 285deg,
              #84fab0 300deg, #8fd3f4 315deg, #8fd3f4 330deg, #ff9a9e 345deg
            );
          }
          .${this.options.namespace}roulette-container .roulette-wheel .wheel-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 50px;
            height: 50px;
            background: #34495e;
            border-radius: 50%;
            z-index: 10;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .${this.options.namespace}roulette-container .roulette-wheel .pointer {
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 15px solid transparent;
            border-right: 15px solid transparent;
            border-top: 30px solid #e74c3c;
            z-index: 20;
          }
          .${this.options.namespace}roulette-container .card-display {
            perspective: 1000px;
          }
          .${this.options.namespace}roulette-container .card {
            width: 200px;
            height: 250px;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.8s;
          }
          .${this.options.namespace}roulette-container .card.flipped {
            transform: rotateY(180deg);
          }
          .${this.options.namespace}roulette-container .card-front,
          .${this.options.namespace}roulette-container .card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 15px;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          }
          .${this.options.namespace}roulette-container .card-front {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .${this.options.namespace}roulette-container .card-back {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            transform: rotateY(180deg);
          }
          .${this.options.namespace}roulette-container .card-content {
            text-align: center;
          }
          .${this.options.namespace}roulette-container .player-id {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .${this.options.namespace}roulette-container .player-name {
            font-size: 24px;
          }
          .${this.options.namespace}roulette-container .card-back-content {
            font-size: 48px;
            color: white;
          }
          .${this.options.namespace}roulette-container .roulette-controls {
            margin-bottom: 30px;
          }
          .${this.options.namespace}roulette-container .btn {
            padding: 12px 24px;
            margin: 0 10px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s;
          }
          .${this.options.namespace}roulette-container .btn-primary {
            background-color: #4361ee;
            color: white;
          }
          .${this.options.namespace}roulette-container .btn-primary:hover:not(:disabled) {
            background-color: #3a56d4;
          }
          .${this.options.namespace}roulette-container .btn-primary:disabled {
            background-color: #bdc3c7;
            cursor: not-allowed;
          }
          .${this.options.namespace}roulette-container .btn-secondary {
            background-color: #6c757d;
            color: white;
          }
          .${this.options.namespace}roulette-container .btn-secondary:hover {
            background-color: #5a6268;
          }
          .${this.options.namespace}roulette-container .result-display {
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            margin-top: 20px;
          }
          .${this.options.namespace}roulette-container .result-content {
            margin-top: 15px;
          }
          .${this.options.namespace}roulette-container .result-player {
            display: inline-block;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      // 全局样式
      const styleId = 'roulette-global-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .roulette-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .roulette-container .roulette-header {
            margin-bottom: 30px;
          }
          .roulette-container h2 {
            color: #2c3e50;
            margin: 0 0 20px 0;
          }
          .roulette-container .mode-selector {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
          }
          .roulette-container .mode-btn {
            padding: 10px 20px;
            border: 2px solid #ddd;
            background: white;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
          }
          .roulette-container .mode-btn.active {
            background: #4361ee;
            color: white;
            border-color: #4361ee;
          }
          .roulette-container .mode-btn:hover {
            border-color: #4361ee;
          }
          .roulette-container .roulette-area {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 50px;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .roulette-container .roulette-wheel-container {
            position: relative;
            display: inline-block;
          }
          .roulette-container .roulette-wheel {
            width: 300px;
            height: 300px;
            border-radius: 50%;
            position: relative;
            overflow: hidden;
            border: 5px solid #34495e;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transition: transform 4s cubic-bezier(0.17, 0.67, 0.83, 0.67);
          }
          .roulette-container .roulette-wheel.flat-mode {
            background: conic-gradient(
              #ff9a9e 0deg, #fecfef 15deg, #fecfef 30deg, #a1c4fd 45deg,
              #a1c4fd 60deg, #c2e9fb 75deg, #c2e9fb 90deg, #d4fc79 105deg,
              #d4fc79 120deg, #96e6a1 135deg, #96e6a1 150deg, #fbc2eb 165deg,
              #fbc2eb 180deg, #a6c1ee 195deg, #a6c1ee 210deg, #f6d365 225deg,
              #f6d365 240deg, #fda085 255deg, #fda085 270deg, #84fab0 285deg,
              #84fab0 300deg, #8fd3f4 315deg, #8fd3f4 330deg, #ff9a9e 345deg
            );
          }
          .roulette-container .roulette-wheel .wheel-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 50px;
            height: 50px;
            background: #34495e;
            border-radius: 50%;
            z-index: 10;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .roulette-container .roulette-wheel .pointer {
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 15px solid transparent;
            border-right: 15px solid transparent;
            border-top: 30px solid #e74c3c;
            z-index: 20;
          }
          .roulette-container .card-display {
            perspective: 1000px;
          }
          .roulette-container .card {
            width: 200px;
            height: 250px;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.8s;
          }
          .roulette-container .card.flipped {
            transform: rotateY(180deg);
          }
          .roulette-container .card-front,
          .roulette-container .card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 15px;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          }
          .roulette-container .card-front {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .roulette-container .card-back {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            transform: rotateY(180deg);
          }
          .roulette-container .card-content {
            text-align: center;
          }
          .roulette-container .player-id {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .roulette-container .player-name {
            font-size: 24px;
          }
          .roulette-container .card-back-content {
            font-size: 48px;
            color: white;
          }
          .roulette-container .roulette-controls {
            margin-bottom: 30px;
          }
          .roulette-container .btn {
            padding: 12px 24px;
            margin: 0 10px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s;
          }
          .roulette-container .btn-primary {
            background-color: #4361ee;
            color: white;
          }
          .roulette-container .btn-primary:hover:not(:disabled) {
            background-color: #3a56d4;
          }
          .roulette-container .btn-primary:disabled {
            background-color: #bdc3c7;
            cursor: not-allowed;
          }
          .roulette-container .btn-secondary {
            background-color: #6c757d;
            color: white;
          }
          .roulette-container .btn-secondary:hover {
            background-color: #5a6268;
          }
          .roulette-container .result-display {
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            margin-top: 20px;
          }
          .roulette-container .result-content {
            margin-top: 15px;
          }
          .roulette-container .result-player {
            display: inline-block;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          }
        `;
        document.head.appendChild(style);
      }
    }
  }

  switchMode(mode) {
    this.state.currentMode = mode;
    
    // 更新按钮状态
    const flatBtn = document.getElementById(`${this.options.namespace}flat-mode`);
    const threeDBtn = document.getElementById(`${this.options.namespace}3d-mode`);
    
    flatBtn.classList.toggle('active', mode === 'flat');
    threeDBtn.classList.toggle('active', mode === '3d');
    
    // 更新转盘样式
    const wheel = document.getElementById(`${this.options.namespace}roulette-wheel`);
    wheel.className = 'roulette-wheel';
    wheel.classList.add(`${mode}-mode`);
    
    // 如果是3D模式，显示卡片
    const cardDisplay = document.getElementById(`${this.options.namespace}card-display`);
    cardDisplay.style.display = mode === '3d' ? 'block' : 'none';
    
    globalAudioManager.playSystemSound('click');
  }

  async spin() {
    if (this.state.isSpinning || this.state.players.length === 0) return;
    
    this.state.isSpinning = true;
    const spinBtn = document.getElementById(`${this.options.namespace}spin-btn`);
    spinBtn.disabled = true;
    
    // 播放音效
    await globalAudioManager.playSystemSound('draw');
    
    // 随机选择结果
    const randomIndex = Math.floor(Math.random() * this.state.players.length);
    const result = this.state.players[randomIndex];
    
    if (this.state.currentMode === 'flat') {
      // 平面转盘动画
      await this.animateFlatWheel(randomIndex);
    } else {
      // 3D卡片翻转动画
      await this.animate3DCard(result);
    }
    
    // 显示结果
    this.showResult(result);
    
    this.state.isSpinning = false;
    spinBtn.disabled = false;
  }

  async animateFlatWheel(selectedIndex) {
    const wheel = document.getElementById(`${this.options.namespace}roulette-wheel`);
    const segmentAngle = 360 / this.state.players.length;
    const extraRotations = 5; // 额外转5圈
    const targetRotation = extraRotations * 360 + (selectedIndex * segmentAngle);
    
    // 应用旋转
    wheel.style.transform = `rotate(${targetRotation}deg)`;
    
    // 等待动画完成
    return new Promise(resolve => {
      setTimeout(resolve, 4000);
    });
  }

  async animate3DCard(result) {
    const card = document.querySelector(`#${this.options.namespace}card-display .card`);
    
    // 先显示背面
    card.classList.remove('flipped');
    
    // 等待一下再翻转
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 显示结果到卡片正面
    const cardFront = card.querySelector('.card-front .card-content');
    cardFront.innerHTML = `
      <div class="player-id">${result.student_id}</div>
      <div class="player-name">${result.name || ''}</div>
    `;
    
    // 翻转卡片
    card.classList.add('flipped');
    
    // 等待翻转动画完成
    return new Promise(resolve => {
      setTimeout(resolve, 1000);
    });
  }

  showResult(result) {
    this.state.currentResult = result;
    
    const resultDisplay = document.getElementById(`${this.options.namespace}result-display`);
    const resultPlayer = resultDisplay.querySelector('.result-player');
    
    resultPlayer.innerHTML = `
      <div class="player-id">${result.student_id}</div>
      <div class="player-name">${result.name || ''}</div>
    `;
    
    resultDisplay.style.display = 'block';
    
    // 播放庆祝音效
    globalAudioManager.playSystemSound('celebration');
  }

  reset() {
    this.state.currentResult = null;
    this.state.rotation = 0;
    
    // 重置转盘
    const wheel = document.getElementById(`${this.options.namespace}roulette-wheel`);
    wheel.style.transform = 'rotate(0deg)';
    
    // 重置卡片
    const card = document.querySelector(`#${this.options.namespace}card-display .card`);
    if (card) {
      card.classList.remove('flipped');
    }
    
    // 隐藏结果
    const resultDisplay = document.getElementById(`${this.options.namespace}result-display`);
    resultDisplay.style.display = 'none';
    
    // 重置卡片内容
    const cardFront = card?.querySelector('.card-front .card-content');
    if (cardFront) {
      cardFront.innerHTML = `
        <div class="player-id">—</div>
        <div class="player-name">—</div>
      `;
    }
    
    globalAudioManager.playSystemSound('click');
  }

  // 设置玩家数据
  setPlayers(players) {
    this.state.players = [...players];
  }

  // 销毁组件
  destroy() {
    const container = document.getElementById(`${this.options.namespace}roulette-container`);
    if (container) {
      container.remove();
    }
    
    // 移除样式
    if (this.options.autoStyleIsolation) {
      const style = document.getElementById(`${this.options.namespace}roulette-styles`);
      if (style) style.remove();
    } else {
      const style = document.getElementById('roulette-global-styles');
      if (style) style.remove();
    }
  }
}