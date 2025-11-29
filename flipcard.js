// 翻卡片功能模块
class FlipCardManager {
  constructor() {
    this.flipCard = null;
    this.isFlipping = false;
    this.initFlipCard();
  }

  initFlipCard() {
    // 创建翻卡片元素
    this.createFlipCardElement();
  }

  createFlipCardElement() {
    // 创建翻卡片容器
    const flipCardContainer = document.createElement('div');
    flipCardContainer.id = 'flipcard-container';
    flipCardContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200px;
      height: 250px;
      perspective: 1000px;
      z-index: 1001;
      display: none;
    `;

    // 创建翻卡片
    this.flipCard = document.createElement('div');
    this.flipCard.id = 'flipcard';
    this.flipCard.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.8s;
    `;

    // 创建卡片正面
    const cardFront = document.createElement('div');
    cardFront.className = 'card-face front';
    cardFront.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      font-weight: bold;
      box-shadow: 0 15px 35px rgba(0,0,0,0.2);
    `;
    cardFront.innerHTML = '点击抽取';

    // 创建卡片背面
    const cardBack = document.createElement('div');
    cardBack.className = 'card-face back';
    cardBack.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
      box-shadow: 0 15px 35px rgba(0,0,0,0.2);
      transform: rotateY(180deg);
    `;

    this.flipCard.appendChild(cardFront);
    this.flipCard.appendChild(cardBack);
    flipCardContainer.appendChild(this.flipCard);
    document.body.appendChild(flipCardContainer);
  }

  // 显示翻卡片
  showFlipCard() {
    const container = document.getElementById('flipcard-container');
    if (container) {
      container.style.display = 'block';
    }
  }

  // 隐藏翻卡片
  hideFlipCard() {
    const container = document.getElementById('flipcard-container');
    if (container) {
      container.style.display = 'none';
    }
  }

  // 执行翻卡片动画
  flipCardToResult(result, callback) {
    if (this.isFlipping) return;
    
    this.isFlipping = true;
    
    // 显示卡片
    this.showFlipCard();
    
    const cardBack = this.flipCard.querySelector('.back');
    cardBack.textContent = result;

    // 添加翻转效果
    setTimeout(() => {
      this.flipCard.style.transform = 'rotateY(180deg)';
    }, 100);

    // 翻转完成后回调
    setTimeout(() => {
      this.isFlipping = false;
      if (callback) {
        callback(result);
      }
      
      // 自动隐藏卡片
      setTimeout(() => {
        this.flipCard.style.transform = 'rotateY(0deg)';
        this.hideFlipCard();
      }, 3000);
    }, 1000);
  }

  // 执行翻卡片抽取过程
  performFlipCardDraw(names, callback) {
    // 显示卡片
    this.showFlipCard();
    
    // 模拟抽取过程的快速翻转
    let flips = 0;
    const maxFlips = 10;
    
    const flipInterval = setInterval(() => {
      if (flips < maxFlips) {
        if (flips % 2 === 0) {
          this.flipCard.style.transform = 'rotateY(180deg)';
        } else {
          this.flipCard.style.transform = 'rotateY(0deg)';
        }
        flips++;
      } else {
        clearInterval(flipInterval);
        
        // 获取最终结果
        const winner = names[Math.floor(Math.random() * names.length)];
        
        // 显示最终结果
        this.flipCardToResult(winner, callback);
      }
    }, 100);
  }
}

// 全局翻卡片管理器实例
const flipCardManager = new FlipCardManager();

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { flipCardManager };
}