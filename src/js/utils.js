// 工具函数模块 - 支持懒加载
class Utils {
  constructor() {
    this.loadedModules = new Set();
  }

  // 懒加载模块
  async loadModule(moduleName) {
    if (this.loadedModules.has(moduleName)) {
      return;
    }

    try {
      switch (moduleName) {
        case 'xlsx':
          // 动态加载 XLSX 库
          if (!window.XLSX) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js';
            document.head.appendChild(script);
            
            // 等待库加载完成
            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = reject;
            });
          }
          break;
          
        case 'animation':
          // 动态加载动画库
          if (!window.Anime) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
            document.head.appendChild(link);
          }
          break;
          
        default:
          console.warn(`Unknown module: ${moduleName}`);
          return;
      }
      
      this.loadedModules.add(moduleName);
      console.log(`Module ${moduleName} loaded successfully`);
    } catch (error) {
      console.error(`Failed to load module ${moduleName}:`, error);
    }
  }

  // 节流函数
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = currentTime;
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  // 防抖函数
  debounce(func, delay) {
    let timeoutId;
    
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // 深拷贝函数
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
      return obj.reduce((arr, item, i) => {
        arr[i] = this.deepClone(item);
        return arr;
      }, []);
    }
    
    if (typeof obj === 'object') {
      return Object.keys(obj).reduce((newObj, key) => {
        newObj[key] = this.deepClone(obj[key]);
        return newObj;
      }, {});
    }
  }

  // 随机数生成器
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 洗牌算法
  shuffleArray(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // 日期格式化
  formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  // 存储工具
  storage = {
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    },

    get(key) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        console.error('Failed to read from localStorage:', e);
        return null;
      }
    },

    remove(key) {
      localStorage.removeItem(key);
    },

    clear() {
      localStorage.clear();
    }
  };

  // 文件处理工具
  file = {
    // 读取Excel文件
    async readExcel(file) {
      await this.loadModule('xlsx');
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => reject(new Error('File read error'));
        reader.readAsArrayBuffer(file);
      });
    },

    // 导出Excel文件
    exportExcel(data, filename = 'data.xlsx') {
      if (!window.XLSX) {
        console.error('XLSX library not loaded');
        return;
      }
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, filename);
    }
  };

  // 动画工具
  animate = {
    // 淡入淡出
    fade(element, duration = 300) {
      element.style.opacity = 0;
      element.style.transition = `opacity ${duration}ms ease-in-out`;
      
      setTimeout(() => {
        element.style.opacity = 1;
      }, 10);
    },

    // 滑入滑出
    slide(element, direction = 'down', duration = 300) {
      const startHeight = element.scrollHeight;
      
      if (direction === 'down') {
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease-in-out`;
        
        setTimeout(() => {
          element.style.height = startHeight + 'px';
        }, 10);
      } else {
        element.style.height = startHeight + 'px';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease-in-out`;
        
        setTimeout(() => {
          element.style.height = '0';
        }, 10);
      }
    }
  };

  // 事件工具
  events = {
    // 一次性事件监听器
    once(element, event, handler) {
      const onceHandler = (e) => {
        handler(e);
        element.removeEventListener(event, onceHandler);
      };
      element.addEventListener(event, onceHandler);
    },

    // 添加多个事件监听器
    addMultiple(element, events, handler) {
      events.forEach(event => {
        element.addEventListener(event, handler);
      });
    }
  };
}

// 创建全局工具实例
const utils = new Utils();

// 暴露到全局作用域
if (typeof window !== 'undefined') {
  window.Utils = Utils;
  window.utils = utils;
}