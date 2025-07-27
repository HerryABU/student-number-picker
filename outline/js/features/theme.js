import { state } from '../core/state.js';
import { showNotification } from '../utils/format.js';

// 切换暗黑模式
        const toggleDarkMode = () => {
          darkMode.value = !darkMode.value;
          document.body.classList.toggle('dark-mode', darkMode.value);
          localStorage.setItem('darkMode', darkMode.value);
        };

        // 获取总人数
        const getTotalNumbers = () => {
          if (operationMode.value === 'list') {
            return currentStudents.value.length;
          } else {
            return end.value - start.value + 1;
          }
        };

        /* 随机数工具开始 */
// 获取所有可选学号
        const getAllNumbers = () => {
          if (operationMode.value === 'list') {
            return [...currentStudents.value];
          } else {
            const numbers = [];
            for (let i = start.value; i <= end.value; i++) {
              numbers.push({ student_id: i, name: '' });
            }
            return numbers;
          }
        };

        // 生成随机颜色
        const getRandomColor = () => {
          const colors = ['#4361ee', '#4cc9f0', '#f72585', '#f8961e', '#7209b7', '#3a86ff'];
          return colors[Math.floor(Math.random() * colors.length)];
        };

        // 权重随机抽取
/* 随机数工具结束 */
        const getWeightedRandomNumber = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          
          if (available.length === 0) return null;
          
          if (probabilityRanges.value.length === 0 || operationMode.value === 'list') {
            const index = Math.floor(Math.random() * available.length);
            return available[index];
          }
          
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
          
          let random = Math.random() * totalWeight;
          
          for (const item of pool) {
            if (random < item.weight) return item.num;
            random -= item.weight;
          }
          
          return pool[0].num;
        };

        /* 控制组件开始 */
// 抽取学号
        const drawNumber = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          
          if (available.length === 0) {
            triggerCelebration();
            return;
          }
          
          const result = getWeightedRandomNumber();
          
          if (result !== null) {
            if (noRepeat.value) {
              usedNumbers.value.push(result);
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

        // 快速抽取模式
        const toggleContinuous = () => {
          if (isContinuous.value) {
            cancelAnimationFrame(animationFrameId.value);
            isContinuous.value = false;
            
            if (noRepeat.value && currentNumber.value !== '—') {
              const exists = usedNumbers.value.some(
                item => item.student_id === currentNumber.value
              );
              
              if (!exists) {
                usedNumbers.value.push(currentStudent.value);
                
                if (usedNumbers.value.length === getTotalNumbers()) {
                  triggerCelebration();
                }
              }
            }
          } else {
            isContinuous.value = true;
            const animate = () => {
              const available = getAllNumbers().filter(item => 
                !usedNumbers.value.some(used => used.student_id === item.student_id)
              );
              
              if (available.length === 0) {
                cancelAnimationFrame(animationFrameId.value);
                isContinuous.value = false;
                triggerCelebration();
                return;
              }
              
              const result = getWeightedRandomNumber();
              currentNumber.value = result.student_id;
              currentStudent.value = result;
              multiDrawResults.value = [result];
              
              animationFrameId.value = requestAnimationFrame(animate);
            };
            
            animate();
          }
        };

        /* 动画功能开始 */
// 多抽效果
        const multiDraw = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          const drawCount = Math.min(multiDrawCount.value, available.length);
          
          if (drawCount === 0) {
            showNotification('没有可抽取的学号了！', 'error');
            return;
          }
          
          multiDrawResults.value = [];
          showMultiEffect.value = true;
          
          let count = 0;
          const interval = setInterval(() => {
            if (count >= drawCount) {
              clearInterval(interval);
              setTimeout(() => {
                showMultiEffect.value = false;
                
                if (multiDrawResults.value.length > 0) {
                  if (multiDrawResults.value.length === 1) {
                    currentNumber.value = multiDrawResults.value[0].student_id;
                    if (operationMode.value === 'list') {
                      currentStudent.value = multiDrawResults.value[0];
                    }
                  } else {
                    currentNumber.value = multiDrawResults.value.map(r => r.student_id).join(', ');
                    if (operationMode.value === 'list') {
                      currentStudent.value = multiDrawResults.value[multiDrawResults.value.length - 1];
                    }
                  }
                  
                  if (noRepeat.value) {
                    usedNumbers.value.push(...multiDrawResults.value);
                  }
                  
                  if (usedNumbers.value.length === getTotalNumbers()) {
                    triggerCelebration();
                  }
                }
              }, 1000);
              return;
            }
            
            const result = getWeightedRandomNumber();
            if (result) {
              multiDrawResults.value.push(result);
              multiEffectNumber.value = result.student_id;
              multiEffectName.value = result.name || '';
              count++;
            }
          }, 300);
        };

        // 批量抽取
/* 动画功能结束 */
        const drawBatchNumbers = () => {
          const available = getAllNumbers().filter(item => 
            !usedNumbers.value.some(used => used.student_id === item.student_id)
          );
          const actualSize = Math.min(batchSize.value, available.length);
          
          if (actualSize === 0) {
            showNotification('没有可抽取的学号了！', 'error');
            return;
          }

          const batch = [];
          for (let i = 0; i < actualSize; i++) {
            const result = getWeightedRandomNumber();
            if (result) {
              batch.push(result);
              if (noRepeat.value) {
                usedNumbers.value.push(result);
              }
            }
          }
          
          if (batch.length > 0) {
            multiDrawResults.value = batch;
            
            if (batch.length === 1) {
              currentNumber.value = batch[0].student_id;
              if (operationMode.value === 'list') {
                currentStudent.value = batch[0];
              }
            } else {
              currentNumber.value = batch.map(r => r.student_id).join(', ');
              if (operationMode.value === 'list') {
                currentStudent.value = batch[batch.length - 1];
              }
            }
            
            if (batch.length > 3) {
              triggerCelebration(`成功抽取${batch.length}人！`, batch.length * 100);
            } else if (usedNumbers.value.length === getTotalNumbers()) {
              triggerCelebration();
            }
          }
        };

        // 触发庆祝动画