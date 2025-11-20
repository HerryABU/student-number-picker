/**
 * XLSX动态加载器
 */

/**
 * 动态加载XLSX库
 * @returns {Promise<Object>} XLSX对象
 */
export async function loadXLSX() {
  // 检查是否已经加载了XLSX
  if (window.XLSX) {
    return window.XLSX;
  }

  // 动态加载XLSX
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    script.onload = () => {
      resolve(window.XLSX);
    };
    script.onerror = () => {
      reject(new Error('Failed to load XLSX'));
    };
    document.head.appendChild(script);
  });
}