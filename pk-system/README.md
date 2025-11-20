# 智能学号抽取系统 V5.8.2

## 重构版 - 模块化、懒加载架构

### 🎯 特性

- **懒加载架构**：首屏零JavaScript执行，仅在调用`initPKModule()`时动态加载Vue
- **完全模块化**：可独立集成到任意页面，不污染宿主环境
- **样式隔离**：自动命名空间前缀，防止CSS冲突
- **功能完整**：保留100%原有功能（学号范围/Excel导入、多组管理、连抽、批量、惊心动魄模式等）
- **按需销毁**：提供destroy方法完全清理资源

### 📁 目录结构

```
pk-system/
├── main.html                    ← 演示页面（仅用于本地演示）
├── core/
│   ├── module.js                ← 全局入口：window.initPKModule(config)
│   ├── loader.js                ← 动态加载Vue、挂载应用、注入样式
│   └── persistence.js           ← localStorage 封装（带版本）
├── lib/
│   └── xlsx-loader.js           ← 动态加载 XLSX（仅在文件上传时）
├── styles/
│   ├── base.css                 ← 全局变量、重置、容器布局（带作用域）
│   ├── display.css              ← 结果区、动画
│   ├── panels.css               ← 设置/批量/历史面板
│   ├── buttons.css              ← 按钮样式
│   ├── dark-mode.css            ← 深色模式
│   └── modal.css                ← 模态框
├── views/
│   └── app.js                   ← Vue 应用定义（setup + template 字符串）
├── components/
│   └── ...                      ← 可选拆分组件（如 Modal、FileUploader）
├── utils/
│   └── ...                      ← 工具函数（URL、概率、动画等）
└── README.md                    ← 集成说明
```

### 🚀 快速集成

在HTML页面中添加容器元素：

```html
<div id="my-container"></div>
```

引入模块并初始化：

```html
<script src="./pk-system/core/module.js"></script>
<script>
  // 初始化系统
  const pkInstance = window.initPKModule({
    target: '#my-container',        // 目标容器选择器
    namespace: 'mypk-',            // 可选：自定义命名空间前缀
    autoStyleIsolation: true       // 可选：自动样式隔离
  });
  
  // 销毁系统（可选）
  // pkInstance.destroy();
</script>
```

### 🔧 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `target` | string | `'#pk-container'` | 目标容器选择器 |
| `namespace` | string | `'pk-'` | 命名空间前缀，用于CSS隔离 |
| `autoStyleIsolation` | boolean | `true` | 是否自动应用样式隔离 |

### 📋 功能列表

- ✅ 学号范围模式 / Excel名单导入
- ✅ 多组管理（创建、重命名、删除分组）
- ✅ 单次抽取 / 快速抽取 / 惊心动魄模式
- ✅ 连抽 / 批量抽取
- ✅ 概率权重设置
- ✅ 深色模式
- ✅ URL参数同步
- ✅ 庆祝动画
- ✅ 自定义模态框
- ✅ 历史记录管理
- ✅ 不重复抽取
- ✅ 字号调节
- ✅ 拖拽上传Excel文件

### 🛡️ 非侵入式集成

- 所有DOM元素ID/类名自动添加命名空间前缀
- 所有CSS限定在`[data-pk-ns="..."]`作用域内
- 不修改宿主页面任何内容
- 完全销毁时清理所有资源（DOM、样式、定时器等）

### ⚡ 懒加载策略

- **初始状态**：不加载Vue、不执行业务逻辑、不注入CSS
- **调用`initPKModule()`后**：
  1. 创建带命名空间的容器DOM
  2. 动态注入作用域CSS
  3. 动态加载Vue 3（CDN）
  4. 创建Vue应用并挂载
  5. 初始化状态和事件监听

### 🧹 资源清理

调用`destroy()`方法可完全清理：

```javascript
const instance = window.initPKModule(config);
// ...
instance.destroy(); // 移除DOM、样式、定时器、事件监听等
```

### 🌐 浏览器兼容性

- 支持现代浏览器（Chrome 79+, Firefox 78+, Safari 14+）
- 需要ES6+支持
- Vue 3运行时依赖

### 📦 技术栈

- Vue 3（动态加载）
- 原生ES6+ JavaScript
- 纯CSS（无预处理器）
- XLSX.js（动态加载）

---

该重构实现了真正的懒加载插件化架构，可在任何页面中按需集成，首屏无负担，交互才加载，功能完整，零污染。