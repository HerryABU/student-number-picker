// data_persistence 模块
// --- 数据持久化 ---
        // 保存学生分组到 localStorage
        const saveGroups = () => {
          localStorage.setItem('studentGroups', JSON.stringify(studentGroups.value));
        };
        // --- 字号设置 ---