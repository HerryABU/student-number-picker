// theme_toggle 模块
// --- 主题切换 ---
        // 切换深色/日间模式
        const toggleDarkMode = () => {
          darkMode.value = !darkMode.value;
          document.body.classList.toggle('dark-mode', darkMode.value);
          localStorage.setItem('darkMode', darkMode.value);
        };
        // --- 文件上传处理 ---