// PK模式模块
class PKModeManager {
  constructor() {
    this.isInPKMode = false;
    this.leftTeam = [];
    this.rightTeam = [];
    this.currentRound = 1;
    this.maxRounds = 3; // 最大回合数
    this.leftScore = 0;
    this.rightScore = 0;
    this.initPKMode();
  }

  initPKMode() {
    // 创建PK模式相关元素
    this.createPKElements();
  }

  createPKElements() {
    // 创建PK容器
    const pkContainer = document.createElement('div');
    pkContainer.id = 'pk-container';
    pkContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 2000;
      display: none;
      justify-content: center;
      align-items: center;
    `;

    // 创建PK舞台
    const pkStage = document.createElement('div');
    pkStage.id = 'pk-stage';
    pkStage.style.cssText = `
      width: 90%;
      max-width: 800px;
      height: 60%;
      max-height: 500px;
      background: linear-gradient(to right, #3498db, #e74c3c);
      border-radius: 20px;
      display: flex;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    `;

    // 创建左侧队伍区域
    const leftTeam = document.createElement('div');
    leftTeam.className = 'team-area left-team';
    leftTeam.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: white;
    `;

    const leftTeamTitle = document.createElement('div');
    leftTeamTitle.textContent = '甲方';
    leftTeamTitle.style.cssText = 'font-size: 24px; font-weight: bold; margin-bottom: 10px;';

    const leftTeamScore = document.createElement('div');
    leftTeamScore.id = 'left-team-score';
    leftTeamScore.textContent = '0';
    leftTeamScore.style.cssText = 'font-size: 48px; font-weight: bold;';

    leftTeam.appendChild(leftTeamTitle);
    leftTeam.appendChild(leftTeamScore);

    // 创建中间分隔线和击剑动画区域
    const centerArea = document.createElement('div');
    centerArea.className = 'center-area';
    centerArea.style.cssText = `
      width: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    `;

    // 创建击剑动画容器
    const fencerContainer = document.createElement('div');
    fencerContainer.id = 'fencer-container';
    fencerContainer.style.cssText = `
      width: 100px;
      height: 150px;
      position: relative;
      margin: 20px 0;
    `;

    // 创建击剑士1
    const fencer1 = document.createElement('div');
    fencer1.id = 'fencer1';
    fencer1.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: 30px;
      height: 60px;
      background: #3498db;
      border-radius: 50% 50% 0 0;
    `;

    // 创建击剑士2
    const fencer2 = document.createElement('div');
    fencer2.id = 'fencer2';
    fencer2.style.cssText = `
      position: absolute;
      right: 0;
      top: 0;
      width: 30px;
      height: 60px;
      background: #e74c3c;
      border-radius: 50% 50% 0 0;
    `;

    // 创建剑
    const sword1 = document.createElement('div');
    sword1.className = 'sword';
    sword1.style.cssText = `
      position: absolute;
      left: 30px;
      top: 25px;
      width: 40px;
      height: 3px;
      background: #ddd;
    `;

    const sword2 = document.createElement('div');
    sword2.className = 'sword';
    sword2.style.cssText = `
      position: absolute;
      right: 30px;
      top: 25px;
      width: 40px;
      height: 3px;
      background: #ddd;
    `;

    fencerContainer.appendChild(fencer1);
    fencerContainer.appendChild(fencer2);
    fencerContainer.appendChild(sword1);
    fencerContainer.appendChild(sword2);

    // 创建回合显示
    const roundDisplay = document.createElement('div');
    roundDisplay.id = 'round-display';
    roundDisplay.textContent = '第1回合';
    roundDisplay.style.cssText = 'font-size: 18px; color: white; margin: 10px 0;';

    centerArea.appendChild(fencerContainer);
    centerArea.appendChild(roundDisplay);

    // 创建右侧队伍区域
    const rightTeam = document.createElement('div');
    rightTeam.className = 'team-area right-team';
    rightTeam.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: white;
    `;

    const rightTeamTitle = document.createElement('div');
    rightTeamTitle.textContent = '乙方';
    rightTeamTitle.style.cssText = 'font-size: 24px; font-weight: bold; margin-bottom: 10px;';

    const rightTeamScore = document.createElement('div');
    rightTeamScore.id = 'right-team-score';
    rightTeamScore.textContent = '0';
    rightTeamScore.style.cssText = 'font-size: 48px; font-weight: bold;';

    rightTeam.appendChild(rightTeamTitle);
    rightTeam.appendChild(rightTeamScore);

    // 组合所有元素
    pkStage.appendChild(leftTeam);
    pkStage.appendChild(centerArea);
    pkStage.appendChild(rightTeam);
    pkContainer.appendChild(pkStage);

    // 添加PK控制按钮
    const pkControls = document.createElement('div');
    pkControls.id = 'pk-controls';
    pkControls.style.cssText = `
      position: absolute;
      bottom: 20px;
      width: 100%;
      display: flex;
      justify-content: center;
      gap: 20px;
    `;

    const startPKBtn = document.createElement('button');
    startPKBtn.id = 'start-pk-btn';
    startPKBtn.textContent = '开始PK';
    startPKBtn.style.cssText = `
      padding: 10px 20px;
      font-size: 16px;
      background: #2ecc71;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    `;

    const endPKBtn = document.createElement('button');
    endPKBtn.id = 'end-pk-btn';
    endPKBtn.textContent = '结束PK';
    endPKBtn.style.cssText = `
      padding: 10px 20px;
      font-size: 16px;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    `;

    pkControls.appendChild(startPKBtn);
    pkControls.appendChild(endPKBtn);
    pkStage.appendChild(pkControls);

    document.body.appendChild(pkContainer);

    // 绑定事件
    this.bindPKEvents();
  }

  bindPKEvents() {
    document.getElementById('start-pk-btn').addEventListener('click', () => {
      this.startPKRound();
    });

    document.getElementById('end-pk-btn').addEventListener('click', () => {
      this.endPKMode();
    });
  }

  // 开始PK模式
  startPKMode(maleNames, femaleNames) {
    this.isInPKMode = true;
    this.leftTeam = [...maleNames];
    this.rightTeam = [...femaleNames];
    this.currentRound = 1;
    this.leftScore = 0;
    this.rightScore = 0;

    // 更新分数显示
    this.updateScore();

    // 显示PK界面
    const pkContainer = document.getElementById('pk-container');
    if (pkContainer) {
      pkContainer.style.display = 'flex';
    }

    // 播放PK音效
    if (typeof audioManager !== 'undefined') {
      audioManager.playPKSound();
    }

    // 开始击剑动画
    this.startFencingAnimation();
  }

  // 开始一个PK回合
  startPKRound() {
    if (this.currentRound > this.maxRounds) {
      this.endPKMode();
      return;
    }

    // 随机选择双方代表
    const leftContestant = this.leftTeam[Math.floor(Math.random() * this.leftTeam.length)];
    const rightContestant = this.rightTeam[Math.floor(Math.random() * this.rightTeam.length)];

    // 显示抽取动画
    this.showPKDraw(leftContestant, rightContestant);

    // 更新回合显示
    document.getElementById('round-display').textContent = `第${this.currentRound}回合`;
  }

  // 显示PK抽取动画
  showPKDraw(leftContestant, rightContestant) {
    // 播放抽取音效
    if (typeof audioManager !== 'undefined') {
      audioManager.playDrawSound();
    }

    // 模拟抽取过程
    let leftText = document.querySelector('.left-team');
    let rightText = document.querySelector('.right-team');

    // 显示抽取过程的随机名字
    let iterations = 0;
    const maxIterations = 20;

    const leftInterval = setInterval(() => {
      if (iterations < maxIterations) {
        const randomName = this.leftTeam[Math.floor(Math.random() * this.leftTeam.length)];
        leftText.innerHTML = `<div>甲方</div><div style="font-size: 18px;">${randomName}</div>`;
        iterations++;
      } else {
        clearInterval(leftInterval);
        leftText.innerHTML = `<div>甲方</div><div style="font-size: 18px; font-weight: bold; color: #f1c40f;">${leftContestant}</div>`;
      }
    }, 100);

    iterations = 0;
    const rightInterval = setInterval(() => {
      if (iterations < maxIterations) {
        const randomName = this.rightTeam[Math.floor(Math.random() * this.rightTeam.length)];
        rightText.innerHTML = `<div>乙方</div><div style="font-size: 18px;">${randomName}</div>`;
        iterations++;
      } else {
        clearInterval(rightInterval);
        rightText.innerHTML = `<div>乙方</div><div style="font-size: 18px; font-weight: bold; color: #f1c40f;">${rightContestant}</div>`;
      }
    }, 100);

    // 判定胜负
    setTimeout(() => {
      this.determineRoundWinner(leftContestant, rightContestant);
    }, 2000);
  }

  // 判定单轮回合胜负
  determineRoundWinner(leftContestant, rightContestant) {
    // 随机判定胜负
    const leftWins = Math.random() > 0.5;

    if (leftWins) {
      this.leftScore++;
      document.querySelector('.left-team').style.transform = 'scale(1.1)';
      document.querySelector('.right-team').style.transform = 'scale(0.9)';
    } else {
      this.rightScore++;
      document.querySelector('.right-team').style.transform = 'scale(1.1)';
      document.querySelector('.left-team').style.transform = 'scale(0.9)';
    }

    // 恢复正常大小
    setTimeout(() => {
      document.querySelector('.left-team').style.transform = 'scale(1)';
      document.querySelector('.right-team').style.transform = 'scale(1)';
    }, 1000);

    // 更新分数
    this.updateScore();

    // 播放庆祝音效
    if (typeof audioManager !== 'undefined') {
      audioManager.playCelebrateSound();
    }

    // 播放TTS
    if (typeof ttsManager !== 'undefined' && ttsManager.enabled) {
      const winner = leftWins ? leftContestant : rightContestant;
      ttsManager.speakName(`${winner}获胜`);
    }

    // 进入下一回合或结束
    setTimeout(() => {
      this.currentRound++;
      if (this.currentRound <= this.maxRounds) {
        setTimeout(() => {
          this.startPKRound();
        }, 1000);
      } else {
        this.endPKMode();
      }
    }, 2000);
  }

  // 更新分数显示
  updateScore() {
    document.getElementById('left-team-score').textContent = this.leftScore;
    document.getElementById('right-team-score').textContent = this.rightScore;
  }

  // 开始击剑动画
  startFencingAnimation() {
    const fencerContainer = document.getElementById('fencer-container');
    if (!fencerContainer) return;

    // 添加击剑动画效果
    setInterval(() => {
      const swords = document.querySelectorAll('.sword');
      swords.forEach((sword, index) => {
        // 随机击剑动作
        if (Math.random() > 0.5) {
          sword.style.transform = index === 0 ? 'translateX(20px)' : 'translateX(-20px)';
        } else {
          sword.style.transform = 'translateX(0)';
        }
      });
    }, 500);
  }

  // 结束PK模式
  endPKMode() {
    this.isInPKMode = false;
    
    // 显示最终结果
    let resultText = '';
    if (this.leftScore > this.rightScore) {
      resultText = `甲方获胜！(${this.leftScore}:${this.rightScore})`;
    } else if (this.rightScore > this.leftScore) {
      resultText = `乙方获胜！(${this.rightScore}:${this.leftScore})`;
    } else {
      resultText = `平局！(${this.leftScore}:${this.rightScore})`;
    }

    // 显示结果
    alert(resultText);

    // 隐藏PK界面
    const pkContainer = document.getElementById('pk-container');
    if (pkContainer) {
      pkContainer.style.display = 'none';
    }

    // 重置状态
    this.currentRound = 1;
    this.leftScore = 0;
    this.rightScore = 0;
  }

  // 检查是否在PK模式中
  isInPK() {
    return this.isInPKMode;
  }
}

// 全局PK模式管理器实例
const pkModeManager = new PKModeManager();

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { pkModeManager };
}