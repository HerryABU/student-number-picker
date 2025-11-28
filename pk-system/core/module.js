/**
 * 智能学号抽取系统 - 模块入口
 * 实现懒加载架构，支持PK模式、转盘模式、节日主题和音效
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.PKModule = factory());
})(this, () => {
  'use strict';

  let instances = new Map(); // 存储所有实例

  // 懒加载函数 - 确保组件真正按需加载
  async function lazyLoadModule(modulePath) {
    try {
      const module = await import(modulePath);
      return module;
    } catch (error) {
      console.error(`Failed to load module: ${modulePath}`, error);
      throw error;
    }
  }

  /**
   * 初始化 PK 模块
   * @param {Object} config - 配置对象
   * @param {string} config.target - 目标容器选择器
   * @param {string} config.namespace - 命名空间前缀
   * @param {boolean} config.autoStyleIsolation - 是否自动样式隔离
   * @returns {Object} 返回包含 destroy 方法的对象
   */
  async function initPKModule(config = {}) {
    // 默认配置
    const defaultConfig = {
      target: '#pk-container',
      namespace: 'pk-',
      autoStyleIsolation: true
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    // 验证目标容器是否存在
    const targetElement = document.querySelector(finalConfig.target);
    if (!targetElement) {
      console.error(`PK Module: Target element "${finalConfig.target}" not found`);
      return { destroy: () => {} };
    }

    // 检查是否已经初始化过
    const existingInstanceId = targetElement.getAttribute('data-pk-instance-id');
    if (existingInstanceId && instances.has(existingInstanceId)) {
      console.warn('PK Module: Already initialized on this target');
      return { destroy: () => {} };
    }

    // 创建实例 ID
    const instanceId = `pk-instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建带命名空间的容器
    const container = document.createElement('div');
    container.id = `${finalConfig.namespace}app`;
    container.setAttribute('data-pk-ns', finalConfig.namespace);
    container.setAttribute('data-pk-instance-id', instanceId);
    
    // 清空目标容器并添加新容器
    targetElement.innerHTML = '';
    targetElement.appendChild(container);

    // 动态注入样式（带命名空间）
    if (finalConfig.autoStyleIsolation) {
      await injectScopedStyles(finalConfig.namespace);
    }

    // 懒加载 Vue 应用 - 确保只有在需要时才加载
    const { createPKApp } = await lazyLoadModule('../views/app.js');
    const app = await createPKApp(finalConfig);
    
    // 挂载应用
    app.mount(`#${finalConfig.namespace}app`);

    // 存储实例
    const instance = {
      app,
      container,
      config: finalConfig,
      destroy: () => destroyInstance(instanceId)
    };
    
    instances.set(instanceId, instance);

    return instance;
  }

  /**
   * 注入带命名空间的样式
   */
  async function injectScopedStyles(namespace) {
    // 首先移除可能存在的旧样式
    const existingStyle = document.getElementById('pk-scoped-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // 通过 fetch 获取样式内容 - 确保懒加载
    const [
      baseCSS,
      displayCSS,
      panelsCSS,
      buttonsCSS,
      darkModeCSS,
      modalCSS
    ] = await Promise.all([
      fetch('../styles/base.css').then(r => r.text()),
      fetch('../styles/display.css').then(r => r.text()),
      fetch('../styles/panels.css').then(r => r.text()),
      fetch('../styles/buttons.css').then(r => r.text()),
      fetch('../styles/dark-mode.css').then(r => r.text()),
      fetch('../styles/modal.css').then(r => r.text())
    ]);

    // 创建样式元素
    const style = document.createElement('style');
    style.id = 'pk-scoped-styles';
    
    // 为所有样式添加命名空间前缀
    const scopedBaseCSS = baseCSS.replace(/\\.([a-zA-Z0-9_-]+)/g, `[data-pk-ns="${namespace}"] .$1`);
    const scopedDisplayCSS = displayCSS.replace(/\\.([a-zA-Z0-9_-]+)/g, `[data-pk-ns="${namespace}"] .$1`);
    const scopedPanelsCSS = panelsCSS.replace(/\\.([a-zA-Z0-9_-]+)/g, `[data-pk-ns="${namespace}"] .$1`);
    const scopedButtonsCSS = buttonsCSS.replace(/\\.([a-zA-Z0-9_-]+)/g, `[data-pk-ns="${namespace}"] .$1`);
    const scopedDarkModeCSS = darkModeCSS.replace(/\\.([a-zA-Z0-9_-]+)/g, `[data-pk-ns="${namespace}"] .$1`);
    const scopedModalCSS = modalCSS.replace(/\\.([a-zA-Z0-9_-]+)/g, `[data-pk-ns="${namespace}"] .$1`);
    
    style.textContent = `
      ${scopedBaseCSS}
      ${scopedDisplayCSS}
      ${scopedPanelsCSS}
      ${scopedButtonsCSS}
      ${scopedDarkModeCSS}
      ${scopedModalCSS}
    `;

    document.head.appendChild(style);
  }

  /**
   * 懒加载PK模式组件
   * @returns {Promise<Object>} PKMode类
   */
  async function loadPKMode() {
    const { PKMode } = await lazyLoadModule('../views/pk-mode.js');
    return PKMode;
  }

  /**
   * 懒加载转盘模式组件
   * @returns {Promise<Object>} RouletteMode类
   */
  async function loadRouletteMode() {
    const { RouletteMode } = await lazyLoadModule('../views/roulette-mode.js');
    return RouletteMode;
  }

  /**
   * 懒加载音频管理器
   * @returns {Promise<Object>} 音频管理器实例
   */
  async function loadAudioManager() {
    const { globalAudioManager } = await lazyLoadModule('./audio.js');
    return globalAudioManager;
  }

  /**
   * 应用节日主题
   * @param {string} theme - 节日主题名称
   */
  function applyFestivalTheme(theme) {
    // 移除现有的节日主题类
    document.body.classList.remove(
      'festival-spring', 
      'festival-christmas', 
      'festival-valentine', 
      'festival-halloween',
      'festival-mode'
    );
    
    // 添加新的节日主题类
    if (theme) {
      document.body.classList.add(`festival-${theme}`, 'festival-mode');
      
      // 添加节日装饰
      addFestivalDecorations(theme);
    }
  }

  /**
   * 添加节日装饰元素
   * @param {string} theme - 节日主题
   */
  function addFestivalDecorations(theme) {
    // 移除现有的装饰
    const existingDecorations = document.querySelector('.festival-decorations');
    if (existingDecorations) {
      existingDecorations.remove();
    }
    
    // 根据主题添加装饰元素
    const decorations = document.createElement('div');
    decorations.className = 'festival-decorations';
    
    let decorationIcons = [];
    switch (theme) {
      case 'spring':
        decorationIcons = ['🎊', '🧧', '🧨', '🥟', '🍊'];
        break;
      case 'christmas':
        decorationIcons = ['🎄', '🎅', '🎁', '❄️', '⛄'];
        break;
      case 'valentine':
        decorationIcons = ['💝', '💕', '💖', '💗', '💞'];
        break;
      case 'halloween':
        decorationIcons = ['🎃', '👻', '💀', '🕷️', '🕸️'];
        break;
      default:
        decorationIcons = ['🎉', '🎊', '✨', '🎈', '🎁'];
    }
    
    decorationIcons.forEach((icon, index) => {
      const decoration = document.createElement('div');
      decoration.className = 'decoration';
      decoration.innerHTML = icon;
      decorations.appendChild(decoration);
    });
    
    document.body.appendChild(decorations);
  }

  /**
   * 销毁实例
   */
  function destroyInstance(instanceId) {
    const instance = instances.get(instanceId);
    if (instance) {
      if (instance.app) {
        instance.app.unmount();
      }
      if (instance.container && instance.container.parentNode) {
        instance.container.parentNode.removeChild(instance.container);
      }
      
      // 移除样式
      const style = document.getElementById('pk-scoped-styles');
      if (style) {
        style.remove();
      }
      
      instances.delete(instanceId);
    }
  }

  // 将初始化函数暴露到全局
  if (typeof window !== 'undefined') {
    window.initPKModule = initPKModule;
    window.loadPKMode = loadPKMode;
    window.loadRouletteMode = loadRouletteMode;
    window.loadAudioManager = loadAudioManager;
    window.applyFestivalTheme = applyFestivalTheme;
  }

  return {
    initPKModule,
    loadPKMode,
    loadRouletteMode,
    loadAudioManager,
    applyFestivalTheme
  };
});