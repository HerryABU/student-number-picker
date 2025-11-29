// 音频处理模块
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.ttsEnabled = true;
    this.initAudioContext();
  }

  // 初始化音频上下文
  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported in this browser');
    }
  }

  // 播放音效
  playSound(type = 'success') {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // 根据类型设置不同的音频参数
      switch (type) {
        case 'success':
          oscillator.type = 'sine';
          oscillator.frequency.value = 800;
          gainNode.gain.value = 0.3;
          break;
        case 'error':
          oscillator.type = 'sawtooth';
          oscillator.frequency.value = 200;
          gainNode.gain.value = 0.2;
          break;
        case 'draw':
          oscillator.type = 'square';
          oscillator.frequency.value = 523.25; // C5
          gainNode.gain.value = 0.15;
          break;
        case 'tension':
          oscillator.type = 'sine';
          oscillator.frequency.value = 440;
          gainNode.gain.value = 0.2;
          break;
        case 'celebration':
          // 播放一系列音调表示庆祝
          this.playCelebrationSound();
          return;
        default:
          oscillator.type = 'sine';
          oscillator.frequency.value = 440;
          gainNode.gain.value = 0.2;
      }

      oscillator.start();
      
      // 设置音量衰减
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
      
      // 停止振荡器
      setTimeout(() => {
        try {
          oscillator.stop();
        } catch (e) {
          // 振荡器可能已经停止
        }
      }, 500);
    } catch (e) {
      console.warn('Error playing sound:', e);
    }
  }

  // 播放庆祝音效
  playCelebrationSound() {
    if (!this.enabled || !this.audioContext) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
    let time = this.audioContext.currentTime;

    notes.forEach((freq, index) => {
      setTimeout(() => {
        try {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.type = 'triangle';
          oscillator.frequency.value = freq;
          gainNode.gain.value = 0.2;
          
          oscillator.start(time + index * 0.2);
          gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.2 + index * 0.2);
          oscillator.stop(time + 0.3 + index * 0.2);
        } catch (e) {
          console.warn('Error playing celebration sound:', e);
        }
      }, index * 200);
    });
  }

  // 播放转盘音效
  playRouletteSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.type = 'sawtooth';
      // 模拟转盘减速的声音效果
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 3);
      oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 4);
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 4);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 4);
    } catch (e) {
      console.warn('Error playing roulette sound:', e);
    }
  }

  // 播放PK音效
  playPKSound(type = 'start') {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      switch (type) {
        case 'start':
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
          oscillator.frequency.setValueAtTime(660, this.audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
          break;
        case 'clash':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
          oscillator.frequency.setValueAtTime(660, this.audioContext.currentTime + 0.05);
          oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
          break;
        case 'win':
          oscillator.type = 'sine';
          const winFreqs = [523.25, 659.25, 783.99];
          winFreqs.forEach((freq, i) => {
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.2);
          });
          gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.6);
          break;
      }
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + (type === 'win' ? 0.6 : 0.3));
    } catch (e) {
      console.warn('Error playing PK sound:', e);
    }
  }

  // 朗读姓名（TTS）
  speakName(name) {
    if (!this.ttsEnabled || !('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported or disabled');
      return;
    }

    // 取消之前的语音
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(name);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // 设置中文语音（如果可用）
    const voices = speechSynthesis.getVoices();
    const chineseVoice = voices.find(voice => 
      voice.lang.includes('zh') || voice.lang.includes('cn')
    );
    
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }
    
    speechSynthesis.speak(utterance);
  }

  // 切换音频开关
  toggleAudio() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // 切换TTS开关
  toggleTTS() {
    this.ttsEnabled = !this.ttsEnabled;
    return this.ttsEnabled;
  }

  // 检查音频是否启用
  isAudioEnabled() {
    return this.enabled;
  }

  // 检查TTS是否启用
  isTTSEnabled() {
    return this.ttsEnabled;
  }
}

// 创建全局音频管理器实例
const audioManager = new AudioManager();

// 暴露到全局作用域（在模块化系统中，通常会通过导出处理）
if (typeof window !== 'undefined') {
  window.AudioManager = AudioManager;
  window.audioManager = audioManager;
}