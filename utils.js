// 工具函数模块
class Utils {
  // 从Excel数据中分离男生女生
  static separateGender(data, genderColumnIndex) {
    const maleNames = [];
    const femaleNames = [];
    const allNames = [];

    data.forEach(row => {
      if (row.length > 0) {
        const name = row[0]; // 假设姓名在第一列
        const gender = genderColumnIndex < row.length ? row[genderColumnIndex] : null;

        allNames.push(name);

        if (gender) {
          if (this.isMale(gender)) {
            maleNames.push(name);
          } else if (this.isFemale(gender)) {
            femaleNames.push(name);
          }
        }
      }
    });

    return { maleNames, femaleNames, allNames };
  }

  // 判断是否为男性
  static isMale(gender) {
    const maleIndicators = ['男', 'male', 'M', 'm', 'boy', '男同学', '男生'];
    return maleIndicators.some(indicator => 
      gender.toString().toLowerCase().includes(indicator.toLowerCase())
    );
  }

  // 判断是否为女性
  static isFemale(gender) {
    const femaleIndicators = ['女', 'female', 'F', 'f', 'girl', '女同学', '女生'];
    return femaleIndicators.some(indicator => 
      gender.toString().toLowerCase().includes(indicator.toLowerCase())
    );
  }

  // 随机抽取指定数量的名字
  static drawRandomNames(names, count = 1) {
    if (names.length === 0) return [];
    if (count >= names.length) return [...names];

    const result = [];
    const availableNames = [...names];

    for (let i = 0; i < count; i++) {
      if (availableNames.length === 0) break;

      const randomIndex = Math.floor(Math.random() * availableNames.length);
      result.push(availableNames[randomIndex]);
      availableNames.splice(randomIndex, 1);
    }

    return result;
  }

  // 创建惊心动魄的抽取动画效果
  static async dramaticDraw(names, callback, options = {}) {
    const {
      duration = 2000,
      interval = 50,
      finalDuration = 500
    } = options;

    return new Promise(resolve => {
      const startTime = Date.now();
      let lastUpdate = startTime;

      const updateDisplay = () => {
        const now = Date.now();
        const elapsed = now - startTime;

        if (elapsed < duration) {
          // 抽取过程中快速切换名字
          if (now - lastUpdate > interval) {
            const randomName = names[Math.floor(Math.random() * names.length)];
            if (callback) callback(randomName, 'changing');
            lastUpdate = now;
          }
          requestAnimationFrame(updateDisplay);
        } else {
          // 抽取结束，显示最终结果
          const finalName = names[Math.floor(Math.random() * names.length)];
          
          // 添加闪烁效果
          let flashCount = 0;
          const flashInterval = setInterval(() => {
            if (flashCount < 6) {
              callback(finalName, flashCount % 2 === 0 ? 'final' : 'flash');
              flashCount++;
            } else {
              clearInterval(flashInterval);
              callback(finalName, 'final');
              resolve(finalName);
            }
          }, 100);
        }
      };

      updateDisplay();
    });
  }

  // 延迟执行函数
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 深拷贝对象
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
  }

  // 随机打乱数组
  static shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // 格式化时间
  static formatTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // 生成唯一ID
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 防抖函数
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 节流函数
  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Utils };
}