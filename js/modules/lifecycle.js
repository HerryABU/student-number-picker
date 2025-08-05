// lifecycle 模块
// --- 生命周期钩子 ---
        // 组件挂载后执行
        onMounted(() => {
          try {
            // 从 localStorage 加载学生分组
            const savedGroups = localStorage.getItem('studentGroups');
            if (savedGroups) {
              studentGroups.value = JSON.parse(savedGroups);
            }
            // 如果没有分组，则创建默认组
            if (studentGroups.value.length === 0) {
              studentGroups.value = [{ name: '默认组', students: [] }];
            }
            // 从 localStorage 加载深色模式设置
            const savedDarkMode = localStorage.getItem('darkMode');
            if (savedDarkMode !== null) {
              darkMode.value = savedDarkMode === 'true';
              document.body.classList.toggle('dark-mode', darkMode.value);
            }
          } catch (e) {
            console.error('Failed to load data from localStorage', e);
          }
          // 如果没有概率范围，则添加一个默认范围
          if (probabilityRanges.value.length === 0) {
            addRange();
          }
          // 应用初始字号设置
          applyFontSettings();
          // 解析并应用URL参数
          const urlParams = parseUrlParams();
          start.value = urlParams.start;
          end.value = urlParams.end;
          mode.value = urlParams.mode;
          noRepeat.value = urlParams.noRepeat;
          operationMode.value = urlParams.operationMode;
          nameSize.value = urlParams.nameSize;
          numberSize.value = urlParams.numberSize;
          multiDrawCount.value = urlParams.multiDrawCount;
          batchSize.value = urlParams.batchSize;
        });
        // --- 侦听器 ---