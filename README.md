---

# 🚀 智能学号抽取系统 V6.0.0：从“能用”到“好用”的工程化重构之路

> **摘要**：在 V5.9.5 修复移动端文件读取 Bug 后，我们迎来了 V6.0.0 的全面升级。本文深度解析 V6.0.0 如何通过 **Vue 3 Render Function** 实现零模板依赖的组件化架构，并详细拆解 **PK 对决模式**、**数学公差随机算法** 以及 **Excel 多 Sheet 智能解析** 的核心代码实现。这不仅是一个点名工具，更是一次纯前端工程化的最佳实践。

## 📌 前言：为什么需要 V6.0.0？

V5.9.5 解决了“能选但读不出”的痛点，但随着用户量的增长，老师们提出了更深层的需求：
1.  **公平性质疑**：“连续抽到 5 号和 6 号，是不是程序有问题？”
2.  **课堂互动性**：“能不能让男生和女生来一场 PK？”
3.  **数据管理效率**：“一个 Excel 里有三个班，我不想拆分成三个文件。”

为了回应这些需求，V6.0.0 没有选择简单的功能堆砌，而是进行了**底层架构的重构**。我们摒弃了传统的 HTML 模板字符串，全面拥抱 **Vue 3 Composition API** 与 **Render Function (h 函数)**，实现了真正的模块化与高性能渲染。

---

## 🏗️ 一、架构升级：模块化与并行加载

### 1.1 入口优化 (`main.js`)
V6.0.0 采用了异步并行加载策略，显著提升了首屏体验。

```javascript
// main.js 核心逻辑
async function init() {
  var loadingEl = createLoadingElement(); // 创建 Loading 界面
  document.body.appendChild(loadingEl);
  
  try {
    // 1. 并行加载 CDN 依赖（Vue, XLSX, FontAwesome）
    var cdnTasks = CDN_DEPS.map(function(dep) {
      if (dep.type === 'css') return loadStylesheet(dep.url);
      return loadScript(dep.url, dep.global);
    });
    await Promise.all(cdnTasks);

    // 2. 并行加载本地模块（core, audio, app, components...）
    var localTasks = LOCAL_MODULES.map(function(mod) {
      return loadScript(mod, null);
    });
    await Promise.all(localTasks);

    loadingEl.remove();
    // 3. 启动应用
    if (window.__SNP && window.__SNP.createApp) {
      window.__SNP.createApp();
    }
  } catch (e) {
    // 错误处理...
  }
}
```

### 1.2 命名空间管理
所有核心逻辑挂载在 `window.__SNP` 下，避免全局污染：
*   `__SNP.core`: 工具函数（Excel 解析、性别检测）。
*   `__SNP.audio`: 音效与语音播报。
*   `__SNP.components`: UI 组件库。
*   `__SNP.createApp`: Vue 应用入口。

---

## ⚔️ 二、核心功能深度解析

### 2.1 PK 对决模式 (Battle Mode)
这是 V6.0.0 最亮眼的功能。系统会自动识别名单中的性别数据，实现智能分队。

#### 核心逻辑 (`app.js` - `getPKGroups`)
```javascript
var getPKGroups = function() {
  var all;
  if (operationMode.value === 'list') {
    all = JSON.parse(JSON.stringify(currentStudents.value));
  } else {
    all = getAllItems(); // 范围模式生成虚拟列表
  }

  // 策略1：如果有性别数据，按性别分队
  if (operationMode.value === 'list' && hasGenderData.value) {
    var sideA = all.filter(function(s) { return s.gender === 'male'; });
    var sideB = all.filter(function(s) { return s.gender === 'female'; });
    return { sideA: sideA, sideB: sideB, sideALabel: '男生', sideBLabel: '女生' };
  }

  // 策略2：无性别数据或范围模式，随机均分两队
  var shuffled = all.sort(function() { return Math.random() - 0.5; });
  var mid = Math.ceil(shuffled.length / 2);
  return { 
    sideA: shuffled.slice(0, mid), 
    sideB: shuffled.slice(mid), 
    sideALabel: 'A队', 
    sideBLabel: 'B队' 
  };
};
```

#### 渲染逻辑 (`DisplayArea.js`)
使用 `h` 函数动态生成红蓝对抗的 UI：
```javascript
SNP.components.PKInlineResult = function(h, s) {
  return h('div', { class: 'pk-results-inline' }, [
    // A 阵营
    h('div', { class: 'pk-inline-side pk-inline-a' }, [
      h('div', { class: 'pk-inline-label' }, '🔵 ' + s.pkResults.value.sideALabel),
      s.pkResults.value.sideA.map(function(st) {
        return h('span', { class: 'pk-chip' }, st.student_id + ' ' + st.name);
      })
    ]),
    // VS 标识
    h('div', { class: 'pk-inline-vs' }, '⚡ VS ⚡'),
    // B 阵营
    h('div', { class: 'pk-inline-side pk-inline-b' }, [
      h('div', { class: 'pk-inline-label' }, '🔴 ' + s.pkResults.value.sideBLabel),
      s.pkResults.value.sideB.map(function(st) {
        return h('span', { class: 'pk-chip' }, st.student_id + ' ' + st.name);
      })
    ])
  ]);
};
```

### 2.2 公差区间算法 (Tolerance Interval)
为了解决“伪随机”带来的质疑，我们引入了**公差限制**。如果开启了公差限制（例如 1~5），且上一次抽中了 `10` 号，那么下一次抽取时，系统会自动过滤掉 `5-15` 号之间的学号。

#### 核心算法 (`app.js` - `getAvailableItems`)
```javascript
if (toleranceEnabled.value && usedList.value.length > 0) {
  var lastId = usedList.value[usedList.value.length - 1].student_id;
  var lastNum = parseInt(lastId);
  if (!isNaN(lastNum)) {
    var filtered = items.filter(function(s) {
      var num = parseInt(s.student_id);
      if (isNaN(num)) return true;
      var diff = Math.abs(num - lastNum);
      // 只有差值在 [min, max] 范围内的才保留
      return diff >= toleranceMin.value && diff <= toleranceMax.value;
    });
    if (filtered.length > 0) items = filtered; // 如果有符合条件的，则缩小候选池
  }
}
```
**效果**：确保连续两次抽取的结果在数字上保持一定的“距离”，让随机性看起来更加均匀和公平。

### 2.3 Excel 多 Sheet 智能解析
不再需要拆分 Excel 文件。`core.js` 中的 `parseExcelAllSheets` 函数会遍历所有工作表。

#### 解析逻辑 (`core.js`)
```javascript
SNP.parseExcelAllSheets = function(arrayBuffer, onSuccess, onError) {
  var wb = XLSX.read(arrayBuffer, { type: 'array' });
  var allSheets = [];
  
  for (var si = 0; si < wb.SheetNames.length; si++) {
    var sheetName = wb.SheetNames[si];
    var ws = wb.Sheets[sheetName];
    var rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    var students = [];
    var genderColIndex = -1;

    // 1. 自动识别性别列
    for (var i = 0; i < rows.length; i++) {
      if (i === 0) { // 检查表头
        for (var j = 0; j < rows[i].length; j++) {
          if (SNP.isGenderColumnName(rows[i][j])) { 
            genderColIndex = j; 
            break; 
          }
        }
      }
      // 2. 提取学生数据并打上 sheet 标签
      var studentId = String(rows[i][0] || '').trim();
      if (!studentId) continue;
      var name = rows[i].length > 1 ? String(rows[i][1] || '').trim() : '';
      var gender = '';
      if (genderColIndex >= 0) {
        gender = SNP.detectGender(rows[i][genderColIndex]);
      }
      students.push({ student_id: studentId, name: name, gender: gender, sheet: sheetName });
    }
    if (students.length > 0) {
      allSheets.push({ name: sheetName, rowCount: students.length, students: students });
    }
  }
  onSuccess(allSheets);
};
```

---

## 🎨 三、UI 渲染引擎：Vue 3 Render Function

V6.0.0 放弃了 `.vue` 文件和模板字符串，直接使用 `Vue.h` 函数构建虚拟 DOM。这种写法虽然代码量稍多，但逻辑极其清晰，且完全由数据驱动。

### 3.1 组件化示例 (`StudentPanel.js`)
```javascript
SNP.components.StudentPanel = function(h, s) {
  return h('div', { class: 'student-panel' }, [
    h('h3', '学生名单管理'),
    // 分组标签页
    h('div', { class: 'group-tabs' }, 
      s.studentGroups.value.map(function(g, i) {
        return h('div', { 
          class: ['group-tab', { active: s.currentGroup.value === g.name }],
          onClick: function() { s.currentGroup.value = g.name; }
        }, g.name);
      })
    ),
    // 上传区域
    h('div', { 
      class: ['upload-area', { 'drag-over': s.isDragOver.value }],
      onDrop: s.handleDrop 
    }, '点击或拖拽上传 Excel'),
    // 学生表格
    h('table', { class: 'student-table' }, 
      s.currentStudents.value.map(function(st) {
        return h('tr', [
          h('td', st.student_id),
          h('td', st.name),
          h('td', st.gender === 'male' ? '男' : '女')
        ]);
      })
    )
  ]);
};
```

### 3.2 样式系统 (`variables.css`)
我们定义了一套完整的 CSS 变量体系，使得**深色模式 (Dark Mode)** 的切换变得极其简单：
```css
:root {
  --primary-color: #4361ee;
  --bg-primary: #f8fafc;
  --text-primary: #1e293b;
}
.dark-mode {
  --primary-color: #5e72e4;
  --bg-primary: #0f172a;
  --text-primary: #f1f5f9;
}
```

---

## 📊 四、版本对比总结

| 功能/特性 | V5.9.5 | V6.0.0 |
|-----------|--------|--------|
| **架构模式** | 单文件/少模块 | **全组件化模块化** |
| **渲染方式** | 模板字符串 | **Vue 3 Render Function** |
| **PK 对决** | ❌ | ✅ **支持男女/随机分队** |
| **公差算法** | ❌ | ✅ **避免连号，提升公平感** |
| **Excel 解析** | 单 Sheet | ✅ **多 Sheet 自动识别+筛选** |
| **多模态抽取** | ❌ | ✅ **一键切换多种模式** |
| **移动端兼容** | ✅ (已修复) | ✅ (保持稳定) |

---

## 💡 五、经验与启示

### 5.1 组件化是复杂交互的解药
当交互逻辑变得复杂（如 PK 模式下的红蓝对抗、多 Sheet 的勾选联动）时，传统的 DOM 操作会变得难以维护。使用 Vue 的响应式数据和 Render Function，让 UI 成为数据的自然映射。

### 5.2 标准 API 永远是最可靠的
无论框架如何迭代，浏览器原生的 `FileReader`、`AudioContext` 和 `SpeechSynthesis` 始终是我们最坚实的基石。私有 API 虽然方便，但往往伴随着兼容性的陷阱。

### 5.3 用户体验在于“细节”
*   **公差算法**解决了学生对随机性的质疑。
*   **多 Sheet 解析**节省了老师拆分文件的时间。
*   **PK 音效**增强了课堂的仪式感。

---

## 📦 六、下载与使用

*   **Web 在线版**：直接访问部署地址，无需安装。
*   **Android APK**：完美支持移动端 Excel 导入与 PK 模式。
*   **桌面原生应用**：Windows/macOS/Linux 安装包。

📢 **下载地址**：[GitHub Releases](https://github.com/HerryABU/student-number-picker)

**更新追随** :  [CSDN](https://blog.csdn.net/Herryfyh)

⭐ **如果这个工具对你有帮助，欢迎 Star、分享！**

---

*© 2026 Herryfyh | 智能学号抽取系统 V6.0.0*
