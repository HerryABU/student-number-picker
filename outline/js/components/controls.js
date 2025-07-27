import { state } from '../core/state.js';

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
/* 主题功能结束 */