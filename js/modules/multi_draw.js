// multi_draw 模块
// --- 连抽 ---
        // 带有动画的连抽
        const multiDrawWithAnimation = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          const drawCount = Math.min(multiDrawCount.value, available.length);
          if (drawCount === 0) {
            showNotification('没有可抽取的学号了！', 'error');
            return;
          }
          // 对于连抽，使用 rollIn 动画
          applyAnimation('rollIn', multiDraw);
        };
        // 执行连抽逻辑
        const multiDraw = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          const drawCount = Math.min(multiDrawCount.value, available.length);
          if (drawCount === 0) return;
          multiDrawResults.value = [];
          showMultiEffect.value = true;
          let count = 0;
          const interval = setInterval(() => {
            if (count >= drawCount) {
              clearInterval(interval);
              setTimeout(() => {
                showMultiEffect.value = false;
                if (multiDrawResults.value.length > 0) {
                  // 修复：始终只将最后一个结果作为“当前”结果
                  const lastResult = multiDrawResults.value[multiDrawResults.value.length - 1];
                  currentNumber.value = lastResult.student_id;
                  currentStudent.value = lastResult;
                  // 如果开启了不重复，则将所有结果都加入历史记录
                  if (noRepeat.value) {
                    multiDrawResults.value.forEach(result => {
                      const exists = usedNumbers.value.some(
                        item => item.student_id === result.student_id
                      );
                      if (!exists) {
                        usedNumbers.value.push(result);
                      }
                    });
                  }
                  if (usedNumbers.value.length === getTotalNumbers()) {
                    triggerCelebration();
                  }
                }
              }, 1000);
              return;
            }
            // 关键修复：在抽取循环内，确保本次抽取的结果不重复
            let result;
            let attempts = 0; // 防止无限循环
            do {
              result = getWeightedRandomNumber();
              attempts++;
              // 如果没有可用学号或尝试次数过多，则跳出
              if (!result || attempts > 100) break;
            } while (result && multiDrawResults.value.some(item => item.student_id === result.student_id));

            if (result) {
              multiDrawResults.value.push(result);
              multiEffectNumber.value = result.student_id;
              multiEffectName.value = result.name || '';
              count++;
            }
          }, 300);
        };
        // --- 批量抽取 ---