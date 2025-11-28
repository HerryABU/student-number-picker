/**
 * Excel文件加载器 - 支持男女生标识
 */
class XLSXLoader {
  constructor() {
    this.xlsxLib = null;
    this.loadXLSXLib();
  }

  // 动态加载XLSX库
  async loadXLSXLib() {
    if (typeof XLSX !== 'undefined') {
      this.xlsxLib = XLSX;
      return;
    }

    try {
      // 创建script标签动态加载XLSX库
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/xlsx/dist/xlsx.full.min.js';
      document.head.appendChild(script);

      // 等待库加载完成
      await new Promise((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load XLSX library'));
      });

      this.xlsxLib = XLSX;
    } catch (e) {
      console.error('Error loading XLSX library:', e);
      throw e;
    }
  }

  // 读取Excel文件
  async readExcel(file) {
    if (!this.xlsxLib) {
      await this.loadXLSXLib();
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = this.xlsxLib.read(data, { type: 'array' });
          
          // 获取第一个工作表
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // 转换为JSON格式
          const jsonData = this.xlsxLib.utils.sheet_to_json(worksheet, { header: 1 });
          
          // 解析数据
          const students = this.parseStudentData(jsonData);
          resolve(students);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsArrayBuffer(file);
    });
  }

  // 解析学生数据
  parseStudentData(data) {
    if (!data || data.length === 0) {
      return [];
    }

    // 假设第一行是标题，从第二行开始是数据
    // 支持以下列格式：学号, 姓名, 性别 或 学号, 姓名
    const students = [];
    const hasGender = data[0] && (data[0][2] || '').toString().toLowerCase().includes('性别');
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 2) continue;
      
      const student = {
        id: row[0] || i,
        name: row[1] || `学生${i}`,
        gender: 'unknown'
      };
      
      // 如果有性别列，读取性别信息
      if (hasGender && row[2]) {
        const genderStr = row[2].toString().toLowerCase();
        if (genderStr.includes('男') || genderStr.includes('m') || genderStr.includes('male')) {
          student.gender = 'male';
        } else if (genderStr.includes('女') || genderStr.includes('f') || genderStr.includes('female')) {
          student.gender = 'female';
        }
      }
      
      students.push(student);
    }
    
    return students;
  }

  // 验证Excel文件
  validateFile(file) {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    return validExtensions.includes(fileExtension);
  }
}

// 导出XLSX加载器
export default XLSXLoader;