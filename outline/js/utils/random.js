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