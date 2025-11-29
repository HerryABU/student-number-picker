// 文字转语音模块
class TTSManager {
  constructor() {
    this.enabled = false;
    this.voice = null;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.initTTS();
  }

  initTTS() {
    // 检查浏览器是否支持SpeechSynthesis API
    if ('speechSynthesis' in window) {
      // 等待语音列表加载
      if (speechSynthesis.getVoices().length > 0) {
        this.setPreferredVoice();
      } else {
        speechSynthesis.onvoiceschanged = () => {
          this.setPreferredVoice();
        };
      }
    } else {
      console.warn('Text-to-Speech not supported in this browser');
    }
  }

  setPreferredVoice() {
    const voices = speechSynthesis.getVoices();
    // 优先选择中文语音
    this.voice = voices.find(voice => 
      voice.lang.includes('zh') || voice.lang.includes('cn')
    ) || voices[0] || null;
  }

  // 播放姓名
  speakName(name) {
    if (!this.enabled || !name || !('speechSynthesis' in window)) {
      return;
    }

    // 停止当前语音
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(name);
    
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    speechSynthesis.speak(utterance);
  }

  // 设置TTS启用状态
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  // 设置语音参数
  setRate(rate) {
    this.rate = rate;
  }

  setPitch(pitch) {
    this.pitch = pitch;
  }

  setVolume(volume) {
    this.volume = volume;
  }
}

// 全局TTS管理器实例
const ttsManager = new TTSManager();

// TTS控制函数
function toggleTTS() {
  const ttsToggle = document.getElementById('ttsToggle');
  const enabled = ttsToggle.checked;
  ttsManager.setEnabled(enabled);
  localStorage.setItem('ttsEnabled', enabled);
}

// 初始化TTS设置
function initTTSSettings() {
  const savedTTS = localStorage.getItem('ttsEnabled');
  const ttsToggle = document.getElementById('ttsToggle');
  
  if (savedTTS !== null) {
    const enabled = savedTTS === 'true';
    ttsToggle.checked = enabled;
    ttsManager.setEnabled(enabled);
  }
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ttsManager, toggleTTS, initTTSSettings };
}