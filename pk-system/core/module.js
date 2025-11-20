/**
 * 智能学号抽取系统 - 模块入口
 * 实现懒加载架构，仅在调用 initPKModule 时动态加载 Vue
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.PKModule = factory());
})(this, () => {
  'use strict';

  let instances = new Map(); // 存储所有实例

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

    // 动态加载 Vue 应用
    const { createPKApp } = await import('../views/app.js');
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

    // 通过 fetch 获取样式内容
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
    const scopedBaseCSS = baseCSS.replace(/\.([a-zA-Z0-9_-]+)/g, `[data-pk-ns="${namespace}"] .$1`);
    const scopedDisplayCSS = displayCSS.replace(/\.([a-zA-Z0-9_-]+)/g, `[data-pk-ns="${namespace}"] .$1`);
    const scopedPanelsCSS = panelsCSS.replace(/\.([a-zA-Z0-9_-]+)/g, `[data-pk-ns="${namespace}"] .$1`);
    const scopedButtonsCSS = buttonsCSS.replace(/\.([a-zA-Z0-9_-]+)/g, `[data-pk-ns="${namespace}"] .$1`);
    const scopedDarkModeCSS = darkModeCSS.replace(/\.([a-zA-Z0-9_-]+)/g, `[data-pk-ns="${namespace}"] .$1`);
    const scopedModalCSS = modalCSS.replace(/\.([a-zA-Z0-9_-]+)/g, `[data-pk-ns="${namespace}"] .$1`);
    
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
  }

  return {
    initPKModule
  };
});