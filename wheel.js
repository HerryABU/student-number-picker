// 转盘功能模块
class WheelManager {
  constructor() {
    this.wheel = null;
    this.isSpinning = false;
    this.currentRotation = 0;
    this.initWheel();
  }

  initWheel() {
    this.wheel = document.getElementById('wheel');
    if (!this.wheel) {
      // 如果没有找到轮盘元素，则创建一个
      this.createWheelElement();
    }
  }

  createWheelElement() {
    // 创建轮盘容器
    const wheelContainer = document.createElement('div');
    wheelContainer.id = 'wheel-container';
    wheelContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      height: 300px;
      z-index: 1000;
      display: none;
    `;

    // 创建轮盘
    this.wheel = document.createElement('div');
    this.wheel.id = 'wheel';
    this.wheel.style.cssText = `
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: conic-gradient(
        #ff6b6b 0deg 45deg,
        #4ecdc4 45deg 90deg,
        #45b7d1 90deg 135deg,
        #96ceb4 135deg 180deg,
        #feca57 180deg 225deg,
        #ff9ff3 225deg 270deg,
        #54a0ff 270deg 315deg,
        #5f27cd 315deg 360deg
      );
      border: 5px solid #333;
      box-shadow: 0 0 20px rgba(0,0,0,0.3);
      transition: transform 4s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    `;

    wheelContainer.appendChild(this.wheel);
    document.body.appendChild(wheelContainer);
  }

  // 平面转盘模式
  spinFlatWheel(names, callback) {
    if (this.isSpinning) return;
    
    this.isSpinning = true;
    
    // 显示轮盘
    const wheelContainer = document.getElementById('wheel-container');
    if (wheelContainer) {
      wheelContainer.style.display = 'block';
    }

    // 计算随机旋转角度（多转几圈增加效果）
    const extraRotation = 5; // 额外转5圈
    const segmentAngle = 360 / names.length;
    const winnerIndex = Math.floor(Math.random() * names.length);
    const winnerAngle = winnerIndex * segmentAngle;
    
    // 总旋转角度：额外圈数 + 随机偏移 + 补偿角度使结果在顶部
    const totalRotation = extraRotation * 360 + 360 - winnerAngle + segmentAngle / 2;
    
    this.currentRotation += totalRotation;
    
    // 应用旋转
    this.wheel.style.transform = `rotate(${this.currentRotation}deg)`;
    
    // 播放音效
    if (typeof audioManager !== 'undefined') {
      audioManager.playWheelSound();
    }
    
    // 旋转结束后回调
    setTimeout(() => {
      this.isSpinning = false;
      if (callback) {
        callback(names[winnerIndex]);
      }
      
      // 隐藏轮盘
      setTimeout(() => {
        if (wheelContainer) {
          wheelContainer.style.display = 'none';
        }
      }, 2000);
    }, 4000);
  }

  // 立体转盘模式（3D环形效果）
  spin3DWheel(names, callback) {
    if (this.isSpinning) return;
    
    this.isSpinning = true;
    
    // 创建3D轮盘容器
    const wheel3DContainer = document.createElement('div');
    wheel3DContainer.id = 'wheel3d-container';
    wheel3DContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      height: 300px;
      perspective: 1000px;
      z-index: 1000;
      display: block;
    `;

    // 创建3D环形容器
    const wheel3D = document.createElement('div');
    wheel3D.id = 'wheel3d';
    wheel3D.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 5s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    `;

    // 计算每个项目的位置
    const itemCount = names.length;
    const radius = 150;
    const angleStep = (2 * Math.PI) / itemCount;

    for (let i = 0; i < itemCount; i++) {
      const item = document.createElement('div');
      const angle = i * angleStep;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      
      item.textContent = names[i];
      item.style.cssText = `
        position: absolute;
        width: 80px;
        height: 60px;
        background: #4ecdc4;
        border: 2px solid #333;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        transform: rotateY(${angle}rad) translateZ(${radius}px);
        transition: all 0.3s ease;
      `;

      wheel3D.appendChild(item);
    }

    wheel3DContainer.appendChild(wheel3D);
    document.body.appendChild(wheel3DContainer);

    // 开始旋转
    const extraRotation = 5; // 额外转5圈
    const winnerIndex = Math.floor(Math.random() * names.length);
    const totalRotation = extraRotation * 360 + (360 / itemCount) * winnerIndex;
    
    setTimeout(() => {
      wheel3D.style.transform = `rotateY(${this.currentRotation + totalRotation}deg)`;
    }, 100);

    // 播放音效
    if (typeof audioManager !== 'undefined') {
      audioManager.playWheelSound();
    }

    // 旋转结束后回调
    setTimeout(() => {
      this.isSpinning = false;
      if (callback) {
        callback(names[winnerIndex]);
      }
      
      // 移除3D轮盘
      setTimeout(() => {
        document.body.removeChild(wheel3DContainer);
      }, 2000);
    }, 5000);
  }

  // 停止转盘
  stopWheel() {
    this.isSpinning = false;
  }
}

// 全局轮盘管理器实例
const wheelManager = new WheelManager();

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { wheelManager };
}