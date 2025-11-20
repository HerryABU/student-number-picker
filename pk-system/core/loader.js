/**
 * 动态加载器 - 负责动态加载Vue
 */

/**
 * 动态加载Vue 3
 * @returns {Promise<Object>} Vue对象
 */
export async function loadVue() {
  // 检查是否已经加载了Vue
  if (window.Vue) {
    return window.Vue;
  }

  // 动态加载Vue
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/vue@3.2.47/dist/vue.global.min.js';
    script.onload = () => {
      resolve(window.Vue);
    };
    script.onerror = () => {
      reject(new Error('Failed to load Vue'));
    };
    document.head.appendChild(script);
  });
}