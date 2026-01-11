// navigation 模块
// --- 页面导航与验证 ---
        // 验证设置并导航到主页面
        const validateAndNavigate = () => {
          if (operationMode.value === 'range') {
            if (start.value > end.value) {
              showNotification('错误：起始学号不能大于结束学号', 'error');
              return;
            }
            if (start.value < 1 || end.value < 1) {
              showNotification('错误：学号不能小于1', 'error');
              return;
            }
            probabilityRanges.value.forEach(range => {
              if (range.start > range.end) {
                showNotification(`错误：范围 ${range.start}-${range.end} 起始值不能大于结束值`, 'error');
                return;
              }
              if (range.start < start.value || range.end > end.value) {
                showNotification(`错误：范围 ${range.start}-${range.end} 超出学号范围`, 'error');
                return;
              }
              if (range.weight <= 0) {
                showNotification(`错误：范围 ${range.start}-${range.end} 权重必须大于0`, 'error');
                return;
              }
            });
          } else if (operationMode.value === 'list') {
            if (currentStudents.value.length === 0) {
              showNotification('错误：当前组没有学生', 'error');
              return;
            }
          }
          isSetupPage.value = false;
          usedNumbers.value = [];
          currentNumber.value = '—';
          currentStudent.value = { student_id: '', name: '' };
          multiDrawResults.value = [];
          updateUrlParams();
        };
        // 返回设置页面
        const goBack = () => {
          if (isContinuous.value) {
            clearInterval(continuousIntervalId.value);
            isContinuous.value = false;
          }
          isSetupPage.value = true;
          updateUrlParams();
        };
        // --- 历史记录管理 ---