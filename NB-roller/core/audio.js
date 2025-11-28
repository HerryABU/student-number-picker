/**
 * 音频管理器 - 使用Web Audio API实现
 */
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.ttsEnabled = false;
    this.oscillators = []; // 存储正在播放的振荡器
    this.buffers = new Map(); // 存储音频缓冲区
    
    // 初始化音频上下文
    this.initAudioContext();
  }

  // 初始化音频上下文
  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  // 恢复音频上下文（由于自动播放策略）
  resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // 设置音效开关
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  // 设置TTS开关
  setTTSEnabled(enabled) {
    this.ttsEnabled = enabled;
  }

  // 播放简单音效（使用振荡器）
  playTone(frequency = 440, duration = 0.1, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

      // 存储振荡器以便清理
      this.oscillators.push(oscillator);
      
      // 清理已完成的振荡器
      setTimeout(() => {
        const index = this.oscillators.indexOf(oscillator);
        if (index > -1) {
          this.oscillators.splice(index, 1);
        }
      }, duration * 1000 + 100);
    } catch (e) {
      console.warn('Error playing tone:', e);
    }
  }

  // 播放点击音效
  playClick() {
    this.playTone(800, 0.05, 'square');
  }

  // 播放抽取音效
  playDraw() {
    this.playTone(600, 0.1, 'sawtooth');
    setTimeout(() => this.playTone(800, 0.05, 'sine'), 100);
  }

  // 播放庆祝音效
  playCelebrate() {
    if (!this.enabled) return;

    // 播放和弦音效
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 'sine');
      }, i * 100);
    });
  }

  // 播放击剑音效
  playFencing() {
    // 快速连续音效
    [800, 900, 1000, 800].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.05, 'square');
      }, i * 30);
    });
  }

  // 播放转盘音效
  playRoulette() {
    // 逐渐升高的音调
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const freq = 200 + i * 20;
        this.playTone(freq, 0.02, 'sawtooth');
      }, i * 30);
    }
  }

  // 播放翻转音效
  playFlip() {
    this.playTone(700, 0.08, 'triangle');
  }

  // 文字转语音
  speak(text) {
    if (!this.ttsEnabled || !('speechSynthesis' in window)) return;

    // 取消之前的语音
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // 使用中文语音（如果可用）
    const voices = speechSynthesis.getVoices();
    const chineseVoice = voices.find(voice => 
      voice.lang.includes('zh') || voice.lang.includes('cn')
    );
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }

    speechSynthesis.speak(utterance);
  }

  // 停止所有音频
  stopAll() {
    // 停止所有振荡器
    this.oscillators.forEach(osc => {
      try {
        if (osc) {
          osc.stop();
        }
      } catch (e) {
        // 忽略错误
      }
    });
    this.oscillators = [];

    // 停止语音合成
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  // 销毁音频管理器
  destroy() {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// 导出音频管理器
export default AudioManager;