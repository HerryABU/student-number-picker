// random_functions 模块
// --- 随机数与概率 ---
        // 获取随机颜色，用于庆祝动画
        const getRandomColor = () => {
          const colors = ['#4361ee', '#4cc9f0', '#f72585', '#f8961e', '#7209b7', '#3a86ff'];
          return colors[Math.floor(Math.random() * colors.length)];
        };
        // 根据权重获取一个随机学号
        const getWeightedRandomNumber = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          if (available.length === 0) return null;
          // 如果没有设置概率范围，或处于名单模式，则使用均匀分布
          if (probabilityRanges.value.length === 0 || operationMode.value === 'list') {
            const index = Math.floor(Math.random() * available.length);
            return available[index];
          }
          // 根据权重构建抽取池
          let pool = [];
          let totalWeight = 0;
          probabilityRanges.value.forEach(range => {
            const nums = getAllNumbers()
              .filter(n => n.student_id >= range.start && n.student_id <= range.end)
              .filter(n => !usedNumbers.value.some(u => u.student_id === n.student_id));
            nums.forEach(n => {
              pool.push({ num: n, weight: range.weight });
              totalWeight += range.weight;
            });
          });
          if (pool.length === 0) return null;
          // 进行加权随机抽取
          let random = Math.random() * totalWeight;
          for (const item of pool) {
            if (random < item.weight) return item.num;
            random -= item.weight;
          }
          return pool[0].num;
        };
        // --- 抽取动画 ---