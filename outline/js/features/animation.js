import { state } from '../core/state.js';
import { showNotification } from '../utils/format.js';

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