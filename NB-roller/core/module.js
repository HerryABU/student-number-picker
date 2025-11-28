/**
 * NB抽学号系统主模块
 * 提供统一的接口来访问所有功能
 */

import AudioManager from './audio.js';
import PersistenceManager from './persistence.js';
import XLSXLoader from '../lib/xlsx-loader.js';
import PKMode from '../views/pk-mode.js';
import RouletteMode from '../views/roulette-mode.js';
import NBRollerApp from '../views/app.js';

// 懒加载函数
async function loadPKMode() {
  // PK模式已经导入，直接返回
  return PKMode;
}

async function loadRouletteMode() {
  // 转盘模式已经导入，直接返回
  return RouletteMode;
}

async function loadAudioManager() {
  // 音频管理器已经导入，直接返回
  return AudioManager;
}

// 应用节日主题
function applyFestivalTheme(theme) {
  if (!theme) {
    document.body.className = document.body.className.replace(/\w+-theme/g, '').trim();
    return;
  }
  
  // 移除所有主题类
  document.body.className = document.body.className.replace(/\w+-theme/g, '').trim();
  // 添加新主题类
  document.body.classList.add(`${theme}-theme`);
}

// 初始化主系统
async function initNBRoller(options = {}) {
  return new NBRollerApp(options);
}

// 导出所有功能
export {
  initNBRoller,
  loadPKMode,
  loadRouletteMode,
  loadAudioManager,
  applyFestivalTheme,
  AudioManager,
  PersistenceManager,
  XLSXLoader,
  PKMode,
  RouletteMode,
  NBRollerApp
};

// 默认导出
export default {
  initNBRoller,
  loadPKMode,
  loadRouletteMode,
  loadAudioManager,
  applyFestivalTheme
};