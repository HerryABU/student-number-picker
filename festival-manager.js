// 节日管理模块
class FestivalManager {
  constructor() {
    this.currentFestival = null;
    this.festivals = {
      'chinese-new-year': 'festival_chinese_new_year.css',
      'dragon-boat': 'festival_dragon_boat.css',
      'mid-autumn': 'festival_mid_autumn.css',
      'double-ninth': 'festival_double_ninth.css',
      'national-day': 'festival_national_day.css',
      'christmas': 'festival_christmas.css',
      'halloween': 'festival_halloween.css'
    };
    this.isFestivalMode = false;
    this.initFestivalManager();
  }

  initFestivalManager() {
    // 检测当前日期并自动应用节日主题
    this.autoDetectFestival();
  }

  // 自动检测节日
  autoDetectFestival() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    // 根据日期自动选择节日
    if (month === 1 && date >= 20 && date <= 31) { // 春节
      this.setFestival('chinese-new-year');
    } else if (month === 2 && date === 14) { // 情人节
      // 没有特定的情人节主题，跳过
    } else if (month === 5 && date === 5) { // 端午节
      this.setFestival('dragon-boat');
    } else if (month === 9 && date === 29) { // 中秋节（农历八月十五）
      this.setFestival('mid-autumn');
    } else if (month === 10 && date === 23) { // 重阳节（农历九月初九）
      this.setFestival('double-ninth');
    } else if (month === 10 && date === 1) { // 国庆节
      this.setFestival('national-day');
    } else if (month === 12 && date === 25) { // 圣诞节
      this.setFestival('christmas');
    } else if (month === 10 && date === 31) { // 万圣节
      this.setFestival('halloween');
    }
  }

  // 设置节日主题
  async setFestival(festivalKey) {
    if (!this.festivals[festivalKey]) {
      console.warn(`Festival ${festivalKey} not found`);
      return;
    }

    // 移除当前节日样式
    this.removeCurrentFestival();

    // 加载新的节日CSS
    await this.loadFestivalCSS(this.festivals[festivalKey]);

    // 添加节日类到body
    document.body.classList.add(`festival-${festivalKey}`);
    this.currentFestival = festivalKey;
    this.isFestivalMode = true;

    // 添加节日装饰元素
    this.addFestivalDecorations(festivalKey);

    // 保存到本地存储
    localStorage.setItem('currentFestival', festivalKey);
  }

  // 移除当前节日样式
  removeCurrentFestival() {
    if (this.currentFestival) {
      document.body.classList.remove(`festival-${this.currentFestival}`);
      this.removeFestivalDecorations();
    }
    this.currentFestival = null;
    this.isFestivalMode = false;
  }

  // 加载节日CSS
  loadFestivalCSS(cssFile) {
    return new Promise((resolve, reject) => {
      // 检查CSS是否已经加载
      const existingLink = document.querySelector(`link[href="${cssFile}"]`);
      if (existingLink) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = cssFile;

      link.onload = () => resolve();
      link.onerror = () => {
        console.warn(`Failed to load festival CSS: ${cssFile}`);
        reject();
      };

      document.head.appendChild(link);
    });
  }

  // 添加节日装饰元素
  addFestivalDecorations(festivalKey) {
    // 清除现有的装饰元素
    this.removeFestivalDecorations();

    // 根据不同节日添加特定装饰
    switch(festivalKey) {
      case 'chinese-new-year':
        this.addChineseNewYearDecorations();
        break;
      case 'dragon-boat':
        this.addDragonBoatDecorations();
        break;
      case 'mid-autumn':
        this.addMidAutumnDecorations();
        break;
      case 'double-ninth':
        this.addDoubleNinthDecorations();
        break;
      case 'national-day':
        this.addNationalDayDecorations();
        break;
      case 'christmas':
        this.addChristmasDecorations();
        break;
      case 'halloween':
        this.addHalloweenDecorations();
        break;
    }
  }

  // 移除节日装饰元素
  removeFestivalDecorations() {
    const decorations = document.querySelectorAll('.festival-decoration');
    decorations.forEach(decoration => decoration.remove());
  }

  // 春节装饰
  addChineseNewYearDecorations() {
    // 添加春节装饰元素（灯笼、鞭炮、福字等）
    for (let i = 0; i < 6; i++) {
      const decoration = document.createElement('div');
      decoration.className = 'festival-decoration';
      document.body.appendChild(decoration);
    }
  }

  // 端午节装饰
  addDragonBoatDecorations() {
    // 添加端午节装饰元素（龙舟、粽子、波浪等）
    for (let i = 0; i < 5; i++) {
      const decoration = document.createElement('div');
      decoration.className = 'festival-decoration';
      document.body.appendChild(decoration);
    }
  }

  // 中秋节装饰
  addMidAutumnDecorations() {
    // 添加中秋节装饰元素（月亮、兔子、灯笼、月饼等）
    for (let i = 0; i < 6; i++) {
      const decoration = document.createElement('div');
      decoration.className = 'festival-decoration';
      document.body.appendChild(decoration);
    }
  }

  // 重阳节装饰
  addDoubleNinthDecorations() {
    // 添加重阳节装饰元素（菊花、山峰、酒杯、叶子等）
    for (let i = 0; i < 8; i++) {
      const decoration = document.createElement('div');
      decoration.className = 'festival-decoration';
      document.body.appendChild(decoration);
    }
  }

  // 国庆节装饰
  addNationalDayDecorations() {
    // 添加国庆节装饰元素（五星、烟花、气球、旗帜等）
    for (let i = 0; i < 12; i++) {
      const decoration = document.createElement('div');
      decoration.className = 'festival-decoration';
      document.body.appendChild(decoration);
    }
  }

  // 圣诞节装饰
  addChristmasDecorations() {
    // 添加圣诞节装饰元素（圣诞树、雪花、礼物、圣诞帽等）
    for (let i = 0; i < 11; i++) {
      const decoration = document.createElement('div');
      decoration.className = 'festival-decoration';
      document.body.appendChild(decoration);
    }
  }

  // 万圣节装饰
  addHalloweenDecorations() {
    // 添加万圣节装饰元素（南瓜灯、幽灵、蝙蝠、蜘蛛等）
    for (let i = 0; i < 9; i++) {
      const decoration = document.createElement('div');
      decoration.className = 'festival-decoration';
      document.body.appendChild(decoration);
    }
  }

  // 获取当前节日
  getCurrentFestival() {
    return this.currentFestival;
  }

  // 检查是否为节日模式
  isInFestivalMode() {
    return this.isFestivalMode;
  }

  // 获取所有节日列表
  getFestivals() {
    return Object.keys(this.festivals);
  }
}

// 全局节日管理器实例
const festivalManager = new FestivalManager();

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { festivalManager };
}