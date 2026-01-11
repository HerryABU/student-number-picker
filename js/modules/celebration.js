// celebration 模块
// --- 庆祝动画 ---
        // 触发庆祝动画
        const triggerCelebration = (message = '所有学号已抽取完成！', duration = 3000) => {
          celebrationMessage.value = message;
          showCelebration.value = true;
          setTimeout(() => {
            showCelebration.value = false;
          }, duration);
        };
        // --- 文件处理 ---