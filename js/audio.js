/* ==================== 音效 & 语音播报模块 ==================== */
(function() {
  'use strict';
  var SNP = window.__SNP;
  SNP.audio = {};

  var audioCtx = null;
  var soundEnabled = true;
  var voiceEnabled = false;

  function getCtx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    return audioCtx;
  }

  // 简单beep音效
  SNP.audio.beep = function(freq, duration, type) {
    if (!soundEnabled) return;
    var ctx = getCtx();
    if (!ctx) return;
    freq = freq || 800;
    duration = duration || 0.15;
    type = type || 'sine';
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  };

  // 抽取成功音效
  SNP.audio.playDraw = function() {
    SNP.audio.beep(600, 0.1, 'sine');
    setTimeout(function() { SNP.audio.beep(900, 0.2, 'sine'); }, 80);
  };

  // PK音效
  SNP.audio.playPK = function() {
    SNP.audio.beep(400, 0.1, 'triangle');
    setTimeout(function() { SNP.audio.beep(500, 0.1, 'triangle'); }, 100);
    setTimeout(function() { SNP.audio.beep(700, 0.15, 'triangle'); }, 200);
    setTimeout(function() { SNP.audio.beep(800, 0.25, 'sine'); }, 300);
  };

  // 庆祝音效
  SNP.audio.playCelebration = function() {
    var notes = [523, 659, 784, 1047];
    notes.forEach(function(f, i) {
      setTimeout(function() { SNP.audio.beep(f, 0.3, 'sine'); }, i * 150);
    });
  };

  // 语音播报（浏览器TTS）
  SNP.audio.speak = function(text) {
    if (!voiceEnabled || !text) return;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 1.0;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  };

  SNP.audio.toggleSound = function() { soundEnabled = !soundEnabled; return soundEnabled; };
  SNP.audio.toggleVoice = function() { voiceEnabled = !voiceEnabled; return voiceEnabled; };
  SNP.audio.isSoundOn = function() { return soundEnabled; };
  SNP.audio.isVoiceOn = function() { return voiceEnabled; };
})();
