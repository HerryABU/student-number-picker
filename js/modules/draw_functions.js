// draw_functions 模块
// --- 单次抽取 ---
        // 带有动画的单次抽取
        const drawNumberWithAnimation = () => {
          multiDrawResults.value = [];
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          if (available.length === 0) {
            triggerCelebration();
            return;
          }
          // 随机选择一个动画
          const animations = ['flip', 'popIn'];
          const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
          // 应用动画并立即执行抽取逻辑
          applyAnimation(randomAnimation, drawNumber);
        };
        // 执行单次抽取逻辑
        const drawNumber = () => {
          const result = getWeightedRandomNumber();
          if (result !== null) {
            if (noRepeat.value) {
              const exists = usedNumbers.value.some(
                item => item.student_id === result.student_id
              );
              if (!exists) {
                usedNumbers.value.push(result);
              }
            }
            currentNumber.value = result.student_id;
            currentStudent.value = result;
            multiDrawResults.value = [result];
            if (usedNumbers.value.length === getTotalNumbers()) {
              triggerCelebration();
            }
          } else {
            triggerCelebration();
          }
        };
        // --- 快速抽取 ---