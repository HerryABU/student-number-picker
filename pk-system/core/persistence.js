/**
 * 数据持久化模块 - 封装localStorage操作
 */

export class PersistenceManager {
  constructor(namespace = 'pk-') {
    this.namespace = namespace;
    this.version = '1.0.0'; // 数据版本
  }

  /**
   * 保存学生分组数据
   * @param {Array} groups - 学生分组数组
   */
  saveGroups(groups) {
    try {
      const data = {
        version: this.version,
        timestamp: Date.now(),
        data: groups
      };
      localStorage.setItem(`${this.namespace}studentGroups`, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save groups to localStorage', e);
    }
  }

  /**
   * 加载学生分组数据
   * @returns {Array} 学生分组数组
   */
  loadGroups() {
    try {
      const stored = localStorage.getItem(`${this.namespace}studentGroups`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 检查版本兼容性（简单版本检查）
        if (parsed.version) {
          return parsed.data || [];
        }
        // 兼容旧版本数据
        return parsed || [];
      }
    } catch (e) {
      console.error('Failed to load groups from localStorage', e);
    }
    return [];
  }

  /**
   * 保存深色模式设置
   * @param {boolean} enabled - 是否启用深色模式
   */
  saveDarkMode(enabled) {
    try {
      localStorage.setItem(`${this.namespace}darkMode`, JSON.stringify({
        version: this.version,
        data: enabled
      }));
    } catch (e) {
      console.error('Failed to save dark mode setting', e);
    }
  }

  /**
   * 加载深色模式设置
   * @returns {boolean} 深色模式是否启用
   */
  loadDarkMode() {
    try {
      const stored = localStorage.getItem(`${this.namespace}darkMode`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.data !== undefined) {
          return parsed.data;
        }
        // 兼容旧版本数据
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load dark mode setting', e);
    }
    return false;
  }

  /**
   * 清除所有持久化数据
   */
  clearAll() {
    try {
      localStorage.removeItem(`${this.namespace}studentGroups`);
      localStorage.removeItem(`${this.namespace}darkMode`);
    } catch (e) {
      console.error('Failed to clear localStorage', e);
    }
  }

  /**
   * 获取所有存储的键
   * @returns {Array} 存储键列表
   */
  getStoredKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.namespace)) {
        keys.push(key);
      }
    }
    return keys;
  }
}