/**
 * 转盘模式组件
 */
class RouletteMode {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      namespace: options.namespace || 'roulette-',
      autoStyleIsolation: options.autoStyleIsolation || false,
      ...options
    };
    
    this.players = [];
    this.currentMode = 'flat'; // 'flat' or '3d'
    this.isSpinning = false;
    this.spinResolve = null;
    
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    // 渲染转盘模式界面
    const rouletteContainer = document.getElementById('roulette-container');
    if (rouletteContainer) {
      rouletteContainer.innerHTML = `
        <div class="roulette-controls">
          <select id="roulette-mode-select" class="mode-select">
            <option value="flat">平面转盘</option>
            <option value="3d">立体转盘</option>
          </select>
          <button id="show-roulette-btn" class="btn btn-primary">显示转盘</button>
        </div>
        <div id="roulette-display" class="roulette-display"></div>
      `;
    }
  }

  bindEvents() {
    const modeSelect = document.getElementById('roulette-mode-select');
    const showBtn = document.getElementById('show-roulette-btn');
    
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        this.currentMode = e.target.value;
      });
    }
    
    if (showBtn) {
      showBtn.addEventListener('click', () => this.showRoulette());
    }
  }

  // 设置玩家
  setPlayers(players = []) {
    this.players = players;
  }

  // 切换模式
  switchMode(mode) {
    this.currentMode = mode;
  }

  // 显示转盘
  showRoulette() {
    if (this.players.length === 0) {
      alert('请先导入学生名单！');
      return;
    }

    const display = document.getElementById('roulette-display');
    if (!display) return;

    if (this.currentMode === 'flat') {
      this.renderFlatRoulette(display);
    } else {
      this.render3DRoulette(display);
    }
  }

  // 渲染平面转盘
  renderFlatRoulette(container) {
    container.innerHTML = `
      <div class="roulette-pointer"></div>
      <div class="flat-roulette" id="flat-roulette-wheel">
        ${this.generateFlatSegments()}
      </div>
      <button id="spin-roulette-btn" class="btn btn-primary spin-btn">开始转动</button>
      <div id="result-display" class="result-display" style="margin-top: 20px; text-align: center; display: none;">
        <div class="number-display" id="roulette-number">--</div>
        <div class="name-display" id="roulette-name">等待结果</div>
      </div>
    `;

    // 绑定转盘事件
    const spinBtn = document.getElementById('spin-roulette-btn');
    if (spinBtn) {
      spinBtn.addEventListener('click', () => this.spinFlatRoulette());
    }
  }

  // 生成平面转盘扇形
  generateFlatSegments() {
    if (this.players.length === 0) return '';

    const anglePerSegment = 360 / this.players.length;
    let segments = '';

    this.players.forEach((player, index) => {
      const startAngle = index * anglePerSegment;
      const endAngle = (index + 1) * anglePerSegment;
      
      // 使用不同颜色
      const hue = (index * 360 / this.players.length) % 360;
      const color = `hsl(${hue}, 70%, 60%)`;
      
      segments += `
        <div class="roulette-segment" style="
          transform: rotate(${startAngle}deg) skewY(${90 - anglePerSegment}deg);
          background: ${color};
        ">
          <div class="roulette-segment-text" style="transform: rotate(${anglePerSegment/2}deg);">
            ${player.name}
          </div>
        </div>
      `;
    });

    return segments;
  }

  // 转动平面转盘
  spinFlatRoulette() {
    if (this.isSpinning) return;

    this.isSpinning = true;
    const spinBtn = document.getElementById('spin-roulette-btn');
    if (spinBtn) {
      spinBtn.disabled = true;
      spinBtn.textContent = '转动中...';
    }

    // 播放转盘音效
    const event = new CustomEvent('playRouletteSound');
    document.dispatchEvent(event);

    const wheel = document.getElementById('flat-roulette-wheel');
    if (!wheel) return;

    // 随机旋转圈数和角度
    const extraRotation = 5; // 额外旋转5圈
    const randomDegree = Math.floor(Math.random() * 360);
    const totalRotation = extraRotation * 360 + randomDegree;

    // 添加旋转动画
    wheel.style.transform = `rotate(${totalRotation}deg)`;

    // 计算结果
    setTimeout(() => {
      this.showRouletteResult(randomDegree);
      this.isSpinning = false;
      
      if (spinBtn) {
        spinBtn.disabled = false;
        spinBtn.textContent = '开始转动';
      }
      
      // 解析Promise
      if (this.spinResolve) {
        this.spinResolve(this.getResultByAngle(randomDegree));
        this.spinResolve = null;
      }
    }, 4000); // 与CSS过渡时间匹配
  }

  // 渲染3D转盘
  render3DRoulette(container) {
    container.innerHTML = `
      <div class="roulette-3d-container">
        <div class="roulette-3d-wheel" id="3d-roulette-wheel">
          ${this.generate3DItems()}
        </div>
      </div>
      <button id="spin-3d-roulette-btn" class="btn btn-primary spin-btn">开始转动</button>
      <div class="flip-card" id="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <div>点击翻转</div>
            <div>查看结果</div>
          </div>
          <div class="flip-card-back">
            <div id="3d-roulette-number">--</div>
            <div id="3d-roulette-name">等待</div>
          </div>
        </div>
      </div>
    `;

    // 绑定3D转盘事件
    const spinBtn = document.getElementById('spin-3d-roulette-btn');
    const flipCard = document.getElementById('flip-card');
    
    if (spinBtn) {
      spinBtn.addEventListener('click', () => this.spin3DRoulette());
    }
    
    if (flipCard) {
      flipCard.addEventListener('click', () => {
        flipCard.classList.toggle('flipped');
        // 播放翻转音效
        const event = new CustomEvent('playFlipSound');
        document.dispatchEvent(event);
      });
    }
  }

  // 生成3D项目
  generate3DItems() {
    if (this.players.length === 0) return '';

    const radius = 200; // 转盘半径
    const angleStep = (2 * Math.PI) / this.players.length;
    let items = '';

    this.players.forEach((player, index) => {
      const angle = index * angleStep;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      items += `
        <div class="roulette-3d-item" style="
          transform: rotateY(${angle}rad) translateZ(${radius}px);
        ">
          ${player.name}
        </div>
      `;
    });

    return items;
  }

  // 转动3D转盘
  spin3DRoulette() {
    if (this.isSpinning) return;

    this.isSpinning = true;
    const spinBtn = document.getElementById('spin-3d-roulette-btn');
    if (spinBtn) {
      spinBtn.disabled = true;
      spinBtn.textContent = '转动中...';
    }

    // 播放转盘音效
    const event = new CustomEvent('playRouletteSound');
    document.dispatchEvent(event);

    const wheel = document.getElementById('3d-roulette-wheel');
    if (!wheel) return;

    // 随机旋转圈数和角度
    const extraRotation = 5; // 额外旋转5圈
    const randomDegree = Math.floor(Math.random() * 360);
    const totalRotation = extraRotation * 360 + randomDegree;

    // 添加旋转动画
    wheel.style.transform = `rotateY(${totalRotation}deg)`;

    // 计算结果
    setTimeout(() => {
      this.show3DResult(randomDegree);
      this.isSpinning = false;
      
      if (spinBtn) {
        spinBtn.disabled = false;
        spinBtn.textContent = '开始转动';
      }
      
      // 解析Promise
      if (this.spinResolve) {
        this.spinResolve(this.getResultByAngle(randomDegree));
        this.spinResolve = null;
      }
    }, 4000); // 与CSS过渡时间匹配
  }

  // 根据角度获取结果
  getResultByAngle(angle) {
    if (this.players.length === 0) return null;

    const anglePerSegment = 360 / this.players.length;
    const segmentIndex = Math.floor((360 - angle) / anglePerSegment) % this.players.length;
    // 修正索引
    const playerIndex = (this.players.length - segmentIndex) % this.players.length;
    
    return this.players[playerIndex];
  }

  // 显示转盘结果
  showRouletteResult(angle) {
    const result = this.getResultByAngle(angle);
    if (result) {
      document.getElementById('roulette-number').textContent = result.id || '--';
      document.getElementById('roulette-name').textContent = result.name;
      document.getElementById('result-display').style.display = 'block';
      
      // 触发全局事件，通知主应用更新历史记录
      const event = new CustomEvent('rouletteResult', {
        detail: {
          player: result,
          type: 'roulette'
        }
      });
      document.dispatchEvent(event);
    }
  }

  // 显示3D转盘结果
  show3DResult(angle) {
    const result = this.getResultByAngle(angle);
    if (result) {
      document.getElementById('3d-roulette-number').textContent = result.id || '--';
      document.getElementById('3d-roulette-name').textContent = result.name;
      
      // 触发全局事件，通知主应用更新历史记录
      const event = new CustomEvent('rouletteResult', {
        detail: {
          player: result,
          type: '3d-roulette'
        }
      });
      document.dispatchEvent(event);
    }
  }

  // 开始转动（返回Promise）
  spin() {
    return new Promise((resolve) => {
      this.spinResolve = resolve;
      if (this.currentMode === 'flat') {
        this.spinFlatRoulette();
      } else {
        this.spin3DRoulette();
      }
    });
  }

  // 销毁组件
  destroy() {
    this.isSpinning = false;
    if (this.spinResolve) {
      this.spinResolve(null);
      this.spinResolve = null;
    }
  }
}

// 导出转盘模式
export default RouletteMode;