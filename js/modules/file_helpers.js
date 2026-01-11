// file_helpers 模块
// --- 文件上传辅助函数 ---
        // 选择文件
        const selectFile = () => {
          document.getElementById('fileInput').click();
        };
        // 处理文件上传事件
        const handleFileUpload = (event) => {
          const file = event.target.files[0];
          if (!file) return;
          handleFileData(file);
          event.target.value = '';
        };
        // --- 学生分组管理 ---