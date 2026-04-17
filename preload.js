// preload.js
try {
  if (typeof window !== 'undefined') {
    const XLSX = require('xlsx');
    const fs = require('fs');
    const path = require('path');

    // 强制注入 XLSX
    Object.defineProperty(window, 'XLSX', {
      value: XLSX,
      writable: false,
      enumerable: true,
      configurable: false
    });

    // 支持 XLSX.writeFile
    window.fs = fs;
    window.path = path;
    window.Buffer = Buffer;
    window.process = process;

    console.log('[✅] XLSX 已就绪:', typeof XLSX.read === 'function');
  }
} catch (err) {
  console.error('[❌] preload.js 加载失败:', err);
}