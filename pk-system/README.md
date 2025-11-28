# 智能学号抽取系统 V6.0

## 功能概述

本系统在原有功能基础上，新增了以下功能：

1. **PK模式（男女生对战）**
2. **击剑动画（开始时）**
3. **转盘抽取模式（平面圆形和立体侧面环形+翻卡片两种）**
4. **节日UI主题**
5. **懒加载机制**
6. **音效系统（使用Web Audio API）**

## 新增功能详情

### 1. PK模式（男女生对战）

- 支持男女生分组对战
- 实时计分系统
- 击剑动画效果
- 音效配合

### 2. 击剑动画

- 在PK模式开始时显示击剑交锋动画
- 使用CSS动画实现
- 配合击剑音效

### 3. 转盘抽取模式

- **平面圆形转盘**：标准圆形转盘，带指针和颜色分区
- **立体环形+翻卡片**：3D立体效果，抽取后翻转卡片显示结果
- 两种模式可自由切换

### 4. 节日UI主题

- **春节主题**：红色系，包含灯笼、红包等装饰
- **圣诞节主题**：红绿配色，包含圣诞树、雪花等装饰
- **情人节主题**：粉色系，包含爱心等装饰
- **万圣节主题**：橙色系，包含南瓜灯、幽灵等装饰
- 节日装饰动态添加，增强节日氛围

### 5. 懒加载机制

- 按需加载组件，提升性能
- 减少初始加载时间
- 模块化架构设计

### 6. 音效系统

- 使用Web Audio API实现
- 包含点击、抽取、庆祝、翻转、击剑等多种音效
- 支持音效开关控制

## 文件结构

```
pk-system/
├── core/
│   ├── module.js           # 主模块文件（新增功能）
│   ├── loader.js           # 加载器
│   ├── persistence.js      # 持久化管理
│   └── audio.js            # 音频管理器（新增）
├── views/
│   ├── app.js              # 主应用
│   ├── pk-mode.js          # PK模式组件（新增）
│   └── roulette-mode.js    # 转盘模式组件（新增）
├── styles/
│   ├── base.css            # 基础样式
│   ├── display.css         # 显示样式
│   ├── panels.css          # 面板样式
│   ├── buttons.css         # 按钮样式
│   ├── dark-mode.css       # 深色模式样式
│   ├── modal.css           # 模态框样式
│   └── festival-theme.css  # 节日主题样式（新增）
├── lib/
│   └── xlsx-loader.js      # Excel加载器
├── main.html               # 主页面
├── demo.html               # 功能演示页面（新增）
└── README.md               # 说明文档
```

## 使用方法

### 1. 演示页面

访问 `demo.html` 页面可以体验所有新功能：

- 点击不同按钮初始化各种模式
- 选择节日主题切换UI
- 控制音效开关
- 切换不同抽取模式

### 2. 代码集成

```javascript
// 引入主模块
import { initPKModule, loadPKMode, loadRouletteMode, loadAudioManager, applyFestivalTheme } from './core/module.js';

// 初始化主系统
const instance = await initPKModule({
  target: '#pk-container',
  namespace: 'my-namespace-',
  autoStyleIsolation: true
});

// 懒加载PK模式
const PKMode = await loadPKMode();
const pkMode = new PKMode(document.getElementById('pk-mode-container'), {
  namespace: 'pk-mode-',
  autoStyleIsolation: true
});

// 懒加载转盘模式
const RouletteMode = await loadRouletteMode();
const rouletteMode = new RouletteMode(document.getElementById('roulette-container'), {
  namespace: 'roulette-',
  autoStyleIsolation: true
});

// 应用节日主题
applyFestivalTheme('spring'); // 可选: 'spring', 'christmas', 'valentine', 'halloween'

// 控制音效
const audioManager = await loadAudioManager();
audioManager.setEnabled(false); // 关闭音效
```

## 技术特点

1. **模块化设计**：各功能模块独立，便于维护和扩展
2. **懒加载机制**：按需加载组件，提升性能
3. **样式隔离**：支持命名空间，避免样式冲突
4. **响应式设计**：适配不同屏幕尺寸
5. **Web Audio API**：原生音频处理，无需额外依赖
6. **节日主题**：动态切换UI主题，增强用户体验

## API 接口

### 主模块函数

- `initPKModule(config)` - 初始化主系统
- `loadPKMode()` - 懒加载PK模式
- `loadRouletteMode()` - 懒加载转盘模式
- `loadAudioManager()` - 懒加载音频管理器
- `applyFestivalTheme(theme)` - 应用节日主题

### 组件方法

- `PKMode.setPlayers(malePlayers, femalePlayers)` - 设置PK模式玩家
- `RouletteMode.setPlayers(players)` - 设置转盘模式玩家
- `RouletteMode.switchMode(mode)` - 切换转盘模式('flat' 或 '3d')
- `AudioManager.setEnabled(enabled)` - 控制音效开关

## 节日主题

- `''` - 默认主题
- `'spring'` - 春节主题
- `'christmas'` - 圣诞节主题
- `'valentine'` - 情人节主题
- `'halloween'` - 万圣节主题

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 性能优化

1. 懒加载机制减少初始加载时间
2. 模块化设计便于按需加载
3. CSS动画替代JavaScript动画提升渲染性能
4. Web Audio API实现高效音效处理

## 开发说明

本系统采用现代Web技术栈，所有新功能均遵循Web标准，无额外依赖，易于部署和维护。