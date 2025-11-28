/**
 * 持久化管理模块
 */
class PersistenceManager {
  constructor(namespace = 'nb-roller-') {
    this.namespace = namespace;
  }

  // 保存数据到localStorage
  save(key, data) {
    try {
      const fullKey = this.namespace + key;
      localStorage.setItem(fullKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  }

  // 从localStorage读取数据
  load(key, defaultValue = null) {
    try {
      const fullKey = this.namespace + key;
      const item = localStorage.getItem(fullKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      return defaultValue;
    }
  }

  // 删除指定键的数据
  remove(key) {
    try {
      const fullKey = this.namespace + key;
      localStorage.removeItem(fullKey);
      return true;
    } catch (e) {
      console.error('Error removing from localStorage:', e);
      return false;
    }
  }

  // 清空所有相关数据
  clear() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.namespace)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (e) {
      console.error('Error clearing localStorage:', e);
      return false;
    }
  }

  // 保存学生列表
  saveStudents(students) {
    return this.save('students', students);
  }

  // 加载学生列表
  loadStudents() {
    return this.load('students', []);
  }

  // 保存抽取历史
  saveHistory(history) {
    return this.save('history', history);
  }

  // 加载抽取历史
  loadHistory() {
    return this.load('history', []);
  }

  // 保存设置
  saveSettings(settings) {
    return this.save('settings', settings);
  }

  // 加载设置
  loadSettings() {
    return this.load('settings', {
      audioEnabled: true,
      ttsEnabled: false,
      currentMode: 'normal',
      festivalTheme: ''
    });
  }

  // 保存节日主题
  saveFestivalTheme(theme) {
    const settings = this.loadSettings();
    settings.festivalTheme = theme;
    return this.saveSettings(settings);
  }

  // 加载节日主题
  loadFestivalTheme() {
    const settings = this.loadSettings();
    return settings.festivalTheme || '';
  }
}

// 导出持久化管理器
export default PersistenceManager;