/**
 * PK模式组件
 */
class PKMode {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      namespace: options.namespace || 'pk-',
      autoStyleIsolation: options.autoStyleIsolation || false,
      ...options
    };
    
    this.malePlayers = [];
    this.femalePlayers = [];
    this.currentMale = null;
    this.currentFemale = null;
    this.maleScore = 0;
    this.femaleScore = 0;
    this.isPKActive = false;
    this.animationInterval = null;
    
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    // 渲染PK模式界面
    const pkContainer = document.getElementById('pk-container');
    if (pkContainer) {
      pkContainer.innerHTML = `
        <div class="pk-controls">
          <button id="start-pk-btn" class="btn btn-primary">开始PK</button>
          <button id="end-pk-btn" class="btn btn-warning" disabled>结束PK</button>
        </div>
        <div class="pk-arena">
          <div class="fencer male-fencer">
            <div class="fencer-info">
              <div class="fencer-name">男生队</div>
              <div class="fencer-score" id="male-score">0</div>
            </div>
            <div class="fencer-character" id="male-character">♂</div>
          </div>
          <div class="vs-separator">VS</div>
          <div class="fencer female-fencer">
            <div class="fencer-info">
              <div class="fencer-name">女生队</div>
              <div class="fencer-score" id="female-score">0</div>
            </div>
            <div class="fencer-character" id="female-character">♀</div>
          </div>
        </div>
        <div id="fencing-animation" class="fencing-animation" style="display: none;">
          <div class="fencer-sprite male-sprite"></div>
          <div class="fencer-sprite female-sprite"></div>
          <div class="sword-effect"></div>
        </div>
      `;
    }
  }

  bindEvents() {
    const startBtn = document.getElementById('start-pk-btn');
    const endBtn = document.getElementById('end-pk-btn');
    
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startPK());
    }
    
    if (endBtn) {
      endBtn.addEventListener('click', () => this.endPK());
    }
  }

  // 设置玩家
  setPlayers(malePlayers = [], femalePlayers = []) {
    this.malePlayers = malePlayers;
    this.femalePlayers = femalePlayers;
  }

  // 开始PK
  async startPK() {
    if (this.malePlayers.length === 0 || this.femalePlayers.length === 0) {
      alert('请先导入包含男女生的学生名单！');
      return;
    }

    this.isPKActive = true;
    document.getElementById('start-pk-btn').disabled = true;
    document.getElementById('end-pk-btn').disabled = false;

    // 播放击剑动画
    this.playFencingAnimation();

    // 开始随机抽取
    this.animationInterval = setInterval(() => {
      this.randomizeCurrentPlayers();
    }, 100);
  }

  // 结束PK
  endPK() {
    this.isPKActive = false;
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }

    // 停止击剑动画
    this.stopFencingAnimation();

    document.getElementById('start-pk-btn').disabled = false;
    document.getElementById('end-pk-btn').disabled = true;

    // 确定最终结果
    this.finalizeResult();
  }

  // 随机化当前玩家
  randomizeCurrentPlayers() {
    if (this.malePlayers.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.malePlayers.length);
      this.currentMale = this.malePlayers[randomIndex];
    }

    if (this.femalePlayers.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.femalePlayers.length);
      this.currentFemale = this.femalePlayers[randomIndex];
    }
  }

  // 确定最终结果
  finalizeResult() {
    // 从剩余玩家中随机选择
    if (this.malePlayers.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.malePlayers.length);
      this.currentMale = this.malePlayers[randomIndex];
    }

    if (this.femalePlayers.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.femalePlayers.length);
      this.currentFemale = this.femalePlayers[randomIndex];
    }

    // 显示结果（这里可以添加更复杂的逻辑，比如比较规则）
    if (this.currentMale && this.currentFemale) {
      // 随机决定胜负
      const maleWins = Math.random() > 0.5;
      if (maleWins) {
        this.maleScore++;
        document.getElementById('male-score').textContent = this.maleScore;
      } else {
        this.femaleScore++;
        document.getElementById('female-score').textContent = this.femaleScore;
      }

      // 触发全局事件，通知主应用更新历史记录
      const event = new CustomEvent('pkResult', {
        detail: {
          male: this.currentMale,
          female: this.currentFemale,
          winner: maleWins ? this.currentMale : this.currentFemale,
          maleScore: this.maleScore,
          femaleScore: this.femaleScore
        }
      });
      document.dispatchEvent(event);
    }
  }

  // 播放击剑动画
  playFencingAnimation() {
    const animationDiv = document.getElementById('fencing-animation');
    if (animationDiv) {
      animationDiv.style.display = 'flex';
    }
  }

  // 停止击剑动画
  stopFencingAnimation() {
    const animationDiv = document.getElementById('fencing-animation');
    if (animationDiv) {
      animationDiv.style.display = 'none';
    }
  }

  // 重置PK
  reset() {
    this.maleScore = 0;
    this.femaleScore = 0;
    this.currentMale = null;
    this.currentFemale = null;
    
    document.getElementById('male-score').textContent = '0';
    document.getElementById('female-score').textContent = '0';
    
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
    
    this.isPKActive = false;
    document.getElementById('start-pk-btn').disabled = false;
    document.getElementById('end-pk-btn').disabled = true;
    
    this.stopFencingAnimation();
  }

  // 销毁组件
  destroy() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    this.stopFencingAnimation();
  }
}

// 导出PK模式
export default PKMode;