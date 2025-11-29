// 音频处理模块
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.sounds = {};
    this.enabled = true;
    this.initAudio();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.5; // 默认音量
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  // 创建简单音效（使用Web Audio API生成）
  createBeep(frequency = 523.25, duration = 0.1, type = 'sine') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // 创建抽取音效
  playDrawSound() {
    if (!this.enabled) return;

    // 创建抽取时的渐强音效
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const freq = 200 + (i * 50);
        this.createBeep(freq, 0.05, 'sine');
      }, i * 50);
    }

    // 最后一个高音表示抽取完成
    setTimeout(() => {
      this.createBeep(1046.50, 0.3, 'sine'); // 高八度C
    }, 500);
  }

  // 创建庆祝音效
  playCelebrateSound() {
    if (!this.enabled) return;

    // 创建和弦音效
    const frequencies = [523.25, 659.25, 783.99]; // C, E, G (C大调和弦)
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.createBeep(freq, 0.5, 'triangle');
      }, index * 100);
    });
  }

  // 创建PK音效
  playPKSound() {
    if (!this.enabled) return;

    // 模拟击剑声音
    this.createBeep(440, 0.1, 'square'); // A音
    setTimeout(() => {
      this.createBeep(554.37, 0.1, 'square'); // C#音
    }, 100);
    setTimeout(() => {
      this.createBeep(659.25, 0.2, 'square'); // E音
    }, 200);
  }

  // 创建转盘音效
  playWheelSound() {
    if (!this.enabled) return;

    // 创建旋转音效
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const freq = 300 + (i * 100);
        this.createBeep(freq, 0.08, 'sawtooth');
      }, i * 80);
    }
  }

  // 设置音量
  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }

  // 启用/禁用音效
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

// 全局音频管理器实例
const audioManager = new AudioManager();

// 音效控制函数
function toggleSound() {
  const soundToggle = document.getElementById('soundToggle');
  const enabled = soundToggle.checked;
  audioManager.setEnabled(enabled);
  localStorage.setItem('soundEnabled', enabled);
}

// 初始化音效设置
function initSoundSettings() {
  const savedSoundSetting = localStorage.getItem('soundEnabled');
  const soundToggle = document.getElementById('soundToggle');
  
  if (savedSoundSetting !== null) {
    const enabled = savedSoundSetting === 'true';
    soundToggle.checked = enabled;
    audioManager.setEnabled(enabled);
  }
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { audioManager, toggleSound, initSoundSettings };
}