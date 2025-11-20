/**
 * Vue应用定义文件 - 包含完整的Vue 3应用逻辑
 */

import { loadVue } from '../core/loader.js';
import { PersistenceManager } from '../core/persistence.js';
import { loadXLSX } from '../lib/xlsx-loader.js';

/**
 * 创建PK应用实例
 * @param {Object} config - 应用配置
 * @returns {Promise<Object>} Vue应用实例
 */
export async function createPKApp(config) {
  const { createApp, ref, computed, onMounted, watch } = await loadVue();
  
  // 定义应用模板字符串
  const template = `
    <!-- 主题切换按钮 -->
    <button class="theme-toggle" @click="toggleDarkMode">
      <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>
    <!-- 页面主内容，包含设置页和主功能页的切换，增加了翻转特效 -->
    <transition name="flip" mode="out-in">
      <!-- 设置页面 -->
      <div v-if="isSetupPage" key="setup">
        <h1><i class="fas fa-users-gear"></i> 学号抽取设置</h1>
        <!-- 操作模式切换 -->
        <div class="mode-switch">
          <div class="mode-button" :class="{ 'active': operationMode === 'range' }" @click="operationMode = 'range'">
            <div class="mode-icon"><i class="fas fa-sort-numeric-up"></i></div>
            <div class="mode-name">学号范围模式</div>
          </div>
          <div class="mode-button" :class="{ 'active': operationMode === 'list' }" @click="operationMode = 'list'">
            <div class="mode-icon"><i class="fas fa-list-ol"></i></div>
            <div class="mode-name">名单导入模式</div>
          </div>
        </div>
        <!-- 学号范围模式下的输入框 -->
        <div v-if="operationMode === 'range'">
          <div class="form-group">
            <label for="start">起始学号：</label>
            <input type="number" v-model.number="start" id="start" min="1">
          </div>
          <div class="form-group">
            <label for="end">结束学号：</label>
            <input type="number" v-model.number="end" id="end" :min="start">
          </div>
        </div>
        <!-- 名单导入模式下的学生管理面板 -->
        <div v-if="operationMode === 'list'">
          <div class="student-list-panel">
            <h3><i class="fas fa-users"></i> 学生名单管理</h3>
            <!-- 分组标签页 -->
            <div class="group-selector">
              <label>名单分组：</label>
              <div class="group-tabs">
                <div v-for="(group, index) in studentGroups" :key="index"
                     class="group-tab"
                     :class="{ 'active': currentGroup === group.name }"
                     @click="switchGroup(group.name)">
                  {{ group.name }} ({{ group.students.length || 0 }})
                  <!-- 重命名分组按钮 -->
                  <button class="delete-group-btn"
                          @click.stop="showRenameGroupModal(group.name, index)"
                          @click.prevent>
                    <i class="fas fa-edit"></i>
                  </button>
                  <!-- 删除分组按钮 -->
                  <button class="delete-group-btn"
                          @click.stop="showDeleteGroupModal(group.name, index)"
                          @click.prevent>
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <!-- "添加新组"按钮 -->
                <button class="primary" @click="showAddGroupModal" style="padding: 0.5rem 1rem;">
                  <i class="fas fa-plus"></i> 新建组
                </button>
              </div>
            </div>
            <!-- 文件上传区域 -->
            <div class="file-upload"
                 @click="selectFile"
                 @dragenter.prevent="handleDragEnter"
                 @dragover.prevent="handleDragOver"
                 @dragleave.prevent="handleDragLeave"
                 @drop.prevent="handleDrop"
                 :class="{ 'drag-over': isDragOver }">
              <input type="file" id="fileInput" accept=".xlsx,.xls" @change="handleFileUpload">
              <div class="upload-icon"><i class="fas fa-file-excel"></i></div>
              <h3>点击或拖拽Excel文件到此处上传</h3>
              <p>支持 .xlsx 和 .xls 格式，A列学号，B列姓名</p>
              <p class="drag-hint" v-if="isDragOver">释放鼠标即可上传文件</p>
            </div>
            <!-- 显示当前组的学生列表 -->
            <div v-if="currentStudents.length > 0">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <p>共 {{ currentStudents.length }} 名学生</p>
                <button class="danger" @click="showClearGroupModal" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                  <i class="fas fa-trash"></i> 清空当前组
                </button>
              </div>
              <table class="student-list">
                <thead>
                  <tr>
                    <th style="width: 40%;">学号</th>
                    <th style="width: 40%;">姓名</th>
                    <th style="width: 20%;">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(student, index) in currentStudents" :key="index">
                    <td>{{ student.student_id }}</td>
                    <td>{{ student.name }}</td>
                    <td>
                      <button class="danger" @click="deleteStudent(index)" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">
                        <i class="fas fa-times"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">
              <p>暂无学生数据，请上传Excel文件</p>
            </div>
          </div>
        </div>
        <!-- 抽取模式选择 -->
        <div class="form-group">
          <label for="mode">抽取模式：</label>
          <select v-model="mode" id="mode">
            <option value="d">单次抽取模式</option>
            <option value="s">快速抽取模式</option>
            <option value="t">惊心动魄模式</option> <!-- 新增选项 -->
          </select>
        </div>
        <!-- 不重复抽取选项 -->
        <div class="form-group">
          <label></label>
          <div style="display: flex; align-items: center;">
            <input type="checkbox" id="noRepeat" v-model="noRepeat" style="margin-right: 0.5rem;">
            <label for="noRepeat" style="margin: 0;">不重复抽取</label>
          </div>
        </div>
        <!-- 开始抽取按钮 -->
        <div class="button-group">
          <button class="primary"
                  @click="validateAndNavigate"
                  :disabled="operationMode === 'list' && currentStudents.length === 0">
            <i class="fas fa-play"></i>
            <span>开始抽取</span>
          </button>
        </div>
        <!-- 高级设置区域 -->
        <div class="advanced-settings">
          <button class="toggle-advanced" @click="showAdvanced = !showAdvanced">
            <i :class="['fas', showAdvanced ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
            {{ showAdvanced ? '隐藏高级设置' : '显示高级设置' }}
          </button>
          <!-- 高级设置面板 -->
          <div class="settings-panel" :class="{ 'show': showAdvanced }">
            <h3><i class="fas fa-percentage"></i> 概率设置</h3>
            <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 1rem;">
              设置不同学号范围的抽取概率权重（默认均匀分布）
            </p>
            <!-- 概率权重范围输入 -->
            <div v-for="(range, index) in probabilityRanges" :key="index" class="range-control">
              <input v-model.number="range.start" type="number" placeholder="起始" :min="start" :max="range.end">
              <span>至</span>
              <input v-model.number="range.end" type="number" placeholder="结束" :min="range.start" :max="end">
              <span>权重</span>
              <input v-model.number="range.weight" type="number" placeholder="权重" min="1">
              <span>%</span>
              <button class="danger" @click="removeRange(index)" style="padding: 0.5rem;">
                <i class="fas fa-trash"></i>
              </button>
            </div>
            <button class="primary" @click="addRange" style="margin-bottom: 1.5rem;">
              <i class="fas fa-plus"></i> 添加范围
            </button>
            <h3><i class="fas fa-text-height"></i> 字号设置</h3>
            <!-- 姓名字号调节滑块 -->
            <div class="form-group">
              <label>姓名字号：{{ nameSize }}rem</label>
              <input type="range" v-model.number="nameSize" min="2" max="15" step="0.1">
            </div>
            <!-- 学号大小调节滑块 -->
            <div class="form-group">
              <label>学号大小：{{ numberSize }}pt</label>
              <input type="range" v-model.number="numberSize" min="60" max="120" step="5">
            </div>
            <!-- 新增：惊心动魄模式配置 -->
            <div v-if="mode === 't'" class="form-group">
              <label>闪烁次数：{{ tensionMaxCount }}</label>
              <input type="range" v-model.number="tensionMaxCount" min="5" max="50" step="1">
            </div>
            <div v-if="mode === 't'" class="form-group">
              <label>闪烁频率：{{ tensionSpeed }}ms</label>
              <input type="range" v-model.number="tensionSpeed" min="50" max="500" step="50">
            </div>
            <button @click="applyFontSettings" class="primary" style="width: 100%;">
              <i class="fas fa-check"></i> 应用字号设置
            </button>
          </div>
        </div>
      </div>
      <!-- 主功能页面 -->
      <div v-else key="main">
        <h1><i class="fas fa-random"></i> 学号抽取结果</h1>
        <!-- 结果显示区域 -->
        <div class="display-area">
          <!-- 姓名显示，仅在名单模式下且有姓名时显示 -->
          <div class="student-name"
               v-if="operationMode === 'list' && currentStudent.name"
               :class="currentAnimationClass">
            {{ currentStudent.name }}
          </div>
          <!-- 学号显示 -->
          <div class="student-id" :class="currentAnimationClass">
            {{ currentNumber }}
          </div>
          <!-- 连抽结果显示区域 -->
          <div class="multi-draw-display" v-if="multiDrawResults.length > 0">
            <div class="multi-draw-list">
              <div v-for="(item, index) in multiDrawResults" :key="index" class="multi-draw-item">
                <div class="multi-draw-item-id">{{ item.student_id }}</div>
                <div class="multi-draw-item-name" v-if="operationMode === 'list' && item.name">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </div>
        <!-- 操作按钮组 -->
        <div class="button-group">
          <!-- 单次抽取按钮 -->
          <button v-if="mode === 'd'" class="primary" @click="drawNumberWithAnimation">
            <i class="fas fa-dice"></i>
            <span>抽取学号</span>
          </button>
          <!-- 快速抽取按钮 -->
          <button v-if="mode === 's'"
                  class="primary"
                  :class="{ 'loading-button': isContinuous }"
                  @click="toggleContinuous">
            <i :class="['fas', isContinuous ? 'fa-stop' : 'fa-play']"></i>
            <span>{{ isContinuous ? '停止抽取' : '开始抽取' }}</span>
          </button>
          <!-- 惊心动魄模式按钮 -->
          <button v-if="mode === 't'" class="primary" @click="startTensionMode">
            <i class="fas fa-heartbeat"></i>
            <span>开始点名</span>
          </button>
          <!-- 连抽按钮 -->
          <button class="primary" @click="multiDrawWithAnimation">
            <i class="fas fa-bolt"></i>
            <span>连抽{{ multiDrawCount }}次</span>
          </button>
          <!-- 批量抽取按钮 -->
          <button class="warning" @click="showBatchSettings = !showBatchSettings">
            <i class="fas fa-users"></i>
            <span>批量抽取</span>
          </button>
          <!-- 返回设置按钮 -->
          <button class="secondary" @click="goBack">
            <i class="fas fa-arrow-left"></i>
            <span>返回设置</span>
          </button>
          <!-- 重置记录按钮 -->
          <button v-if="usedNumbers.length > 0" class="danger" @click="showResetHistoryModal">
            <i class="fas fa-sync-alt"></i>
            <span>重置记录</span>
          </button>
        </div>
        <!-- 批量抽取设置面板 -->
        <transition name="fade">
          <div v-if="showBatchSettings" class="batch-panel show">
            <h3><i class="fas fa-users"></i> 批量抽取设置</h3>
            <div class="form-group">
              <label for="customMultiCount">连抽次数：</label>
              <input type="number" v-model.number="multiDrawCount" id="customMultiCount" min="1" max="50">
            </div>
            <div class="form-group">
              <label for="batchSize">抽取人数：</label>
              <input
                type="number"
                v-model.number="batchSize"
                id="batchSize"
                min="1"
                :max="getTotalNumbers() - usedNumbers.length"
              >
            </div>
            <button class="primary" @click="drawBatchNumbersWithAnimation">
              <i class="fas fa-user-friends"></i>
              <span>抽取{{batchSize}}人</span>
            </button>
          </div>
        </transition>
        <!-- 历史记录区域 -->
        <div v-if="usedNumbers.length > 0" class="history">
          <div class="history-title">
            <span>已抽取记录 ({{ usedNumbers.length }}/{{ getTotalNumbers() }})</span>
            <button @click="showClearHistoryModal" style="background:none;border:none;color:var(--text-light);font-size:0.8rem;">
              <i class="fas fa-trash"></i> 清除
            </button>
          </div>
          <div class="history-items">
            <span v-for="(item, index) in usedNumbers"
                  :key="index"
                  class="history-item"
                  :class="{ 'latest': index === usedNumbers.length - 1 }">
              <span class="student-id">{{ item.student_id }}</span>
              <span class="student-name" v-if="operationMode === 'list' && item.name">{{ item.name }}</span>
            </span>
          </div>
        </div>
      </div>
    </transition>
    <!-- 全屏抽取效果，用于连抽和批量抽取 -->
    <div class="multi-draw-effect" v-if="showMultiEffect">
      <div class="effect-number">{{ multiEffectNumber }}</div>
      <div class="effect-name" v-if="operationMode === 'list' && multiEffectName">{{ multiEffectName }}</div>
      <div class="effect-list" v-if="multiDrawResults.length > 0">
        <div v-for="(item, index) in multiDrawResults" :key="index" class="effect-item">
          <div class="effect-item-id">{{ item.student_id }}</div>
          <div class="effect-item-name" v-if="operationMode === 'list' && item.name">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <!-- 庆祝动画，当所有学号被抽完时触发 -->
    <div v-if="showCelebration" class="celebration">
      <div v-for="n in 50" :key="n"
           class="confetti"
           :style="{
             left: Math.random() * 100 + '%',
             background: getRandomColor(),
             animation: \`confetti-fall \${Math.random() * 3 + 2}s linear forwards\`,
             animationDelay: Math.random() * 0.5 + 's',
             width: Math.random() * 10 + 5 + 'px',
             height: Math.random() * 10 + 5 + 'px'
           }">
      </div>
      <div class="message">
        <i class="fas fa-trophy"></i> {{celebrationMessage}}
      </div>
    </div>
    <!-- 通知消息 -->
    <div class="notification" :class="notification.type" :class="{ 'show': notification.show }">
      <div class="notification-icon"><i :class="notification.icon"></i></div>
      <div class="notification-content">{{ notification.message }}</div>
    </div>
    <!-- ============ 新增的模态框 (Modal) ============ -->
    <!-- 统一的模态框 -->
    <div v-if="showModal" class="modal-backdrop" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">{{ modalConfig.title }}</h5>
        </div>
        <div class="modal-body">
          <p>{{ modalConfig.message }}</p>
          <input
            v-if="modalConfig.inputRequired"
            type="text"
            v-model="modalConfig.inputValue"
            :placeholder="modalConfig.inputPlaceholder"
            @keyup.enter="modalConfig.onConfirm"
            ref="modalInputRef"
          >
        </div>
        <div class="modal-footer">
          <button class="secondary" @click="closeModal">取消</button>
          <button :class="['primary', modalConfig.danger ? 'danger' : '']" @click="modalConfig.onConfirm">
            {{ modalConfig.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `;

  return createApp({
    template,
    setup() {
      // 初始化持久化管理器
      const persistenceManager = new PersistenceManager(config.namespace || 'pk-');
      
      // --- 状态变量 ---
      const isDragOver = ref(false); // 拖拽状态
      const isSetupPage = ref(true); // 当前是否为设置页面
      const darkMode = ref(false); // 深色模式状态
      const showAdvanced = ref(false); // 高级设置面板是否展开
      const showBatchSettings = ref(false); // 批量抽取设置面板是否显示
      const showMultiEffect = ref(false); // 全屏抽取效果是否显示
      const showCelebration = ref(false); // 庆祝动画是否显示
      const isContinuous = ref(false); // 快速抽取模式是否正在运行
      const continuousIntervalId = ref(null); // 快速抽取的定时器ID
      const currentAnimationClass = ref(''); // 当前应用的动画类名
      // --- 新增：惊心动魄模式相关状态 ---
      const isTensionMode = ref(false); // 是否处于"惊心动魄"闪烁状态
      const tensionIntervalId = ref(null); // 闪烁模式的定时器ID
      const tensionCount = ref(0); // 当前已闪烁次数
      const tensionMaxCount = ref(20); // 最大闪烁次数 (可配置)
      const tensionSpeed = ref(100); // 闪烁速度 (毫秒)，数值越小越快
      // --- 模态框状态 ---
      const showModal = ref(false);
      const modalConfig = ref({
        title: '',
        message: '',
        confirmText: '确定',
        danger: false,
        onConfirm: () => {},
        // 新增：用于动态输入
        inputRequired: false,
        inputValue: '',
        inputPlaceholder: ''
      });
      // 用于在模态框打开后自动聚焦输入框
      const modalInputRef = ref(null);
      // --- 核心数据 ---
      const operationMode = ref('range'); // 操作模式: 'range' | 'list'
      const start = ref(1); // 起始学号
      const end = ref(40); // 结束学号
      const mode = ref('d'); // 抽取模式: 'd' (单次) | 's' (快速) | 't' (惊心动魄)
      const noRepeat = ref(true); // 是否不重复抽取
      const currentNumber = ref('—'); // 当前显示的学号
      const currentStudent = ref({ student_id: '', name: '' }); // 当前显示的学生
      const usedNumbers = ref([]); // 已抽取的学号历史记录
      const multiDrawResults = ref([]); // 连抽/批量抽取的中间结果
      const studentGroups = ref([]); // 存储所有学生分组
      const currentGroup = ref('默认组'); // 当前选中的分组名
      const probabilityRanges = ref([]); // 概率权重范围数组
      const celebrationMessage = ref('所有学号已抽取完成！'); // 庆祝消息
      const notification = ref({ // 通知消息对象
        show: false,
        message: '',
        type: '',
        icon: ''
      });
      const multiEffectNumber = ref(0); // 全屏效果中显示的学号
      const multiEffectName = ref(''); // 全屏效果中显示的姓名
      // --- 用户界面设置 ---
      const nameSize = ref(5); // 姓名字号 (rem)
      const numberSize = ref(80); // 学号大小 (pt)
      const multiDrawCount = ref(5); // 连抽次数
      const batchSize = ref(1); // 批量抽取人数

      // --- 计算属性 ---
      // 计算当前分组的学生列表
      const currentStudents = computed(() => {
        const group = studentGroups.value.find(g => g.name === currentGroup.value);
        return group ? group.students : [];
      });
      // 计算总共有多少个可抽取的学号
      const getTotalNumbers = () => {
        if (operationMode.value === 'list') {
          return currentStudents.value.length;
        } else {
          return end.value - start.value + 1;
        }
      };
      // 获取所有可用的学号（包括学号和姓名）
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

      // --- URL参数处理 ---
      // 将概率权重数组编码为URL安全的字符串
      const encodeProbabilityRanges = (ranges) => {
        return ranges.map(r => `${r.start}-${r.end}-${r.weight}`).join(';');
      };
      // 将URL中的字符串解码为概率权重数组
      const decodeProbabilityRanges = (str) => {
        if (!str) return [];
        return str.split(';').map(part => {
          const [start, end, weight] = part.split('-').map(Number);
          return { start, end, weight };
        }).filter(r => !isNaN(r.start) && !isNaN(r.end) && !isNaN(r.weight));
      };
      // 从URL参数中解析初始设置
      const parseUrlParams = () => {
        const params = new URLSearchParams(window.location.search);
        return {
          start: params.has('start') ? parseInt(params.get('start')) : 1,
          end: params.has('end') ? parseInt(params.get('end')) : 40,
          mode: params.get('mode') || 'd',
          noRepeat: params.has('noRepeat') ? params.get('noRepeat') === 'true' : true,
          operationMode: params.get('operationMode') || 'range',
          nameSize: params.has('nameSize') ? parseFloat(params.get('nameSize')) : 5,
          numberSize: params.has('numberSize') ? parseInt(params.get('numberSize')) : 80,
          multiDrawCount: params.has('multiDrawCount') ? parseInt(params.get('multiDrawCount')) : 5,
          batchSize: params.has('batchSize') ? parseInt(params.get('batchSize')) : 1,
          tensionMaxCount: params.has('tensionMaxCount') ? parseInt(params.get('tensionMaxCount')) : 20,
          tensionSpeed: params.has('tensionSpeed') ? parseInt(params.get('tensionSpeed')) : 100,
          probabilityRanges: decodeProbabilityRanges(params.get('probabilityRanges'))
        };
      };
      // 将当前设置同步到URL参数
      const updateUrlParams = () => {
        const params = new URLSearchParams();
        params.set('start', start.value);
        params.set('end', end.value);
        params.set('mode', mode.value);
        params.set('noRepeat', noRepeat.value);
        params.set('operationMode', operationMode.value);
        params.set('nameSize', nameSize.value);
        params.set('numberSize', numberSize.value);
        params.set('multiDrawCount', multiDrawCount.value);
        params.set('batchSize', batchSize.value);
        params.set('tensionMaxCount', tensionMaxCount.value);
        params.set('tensionSpeed', tensionSpeed.value);
        if (probabilityRanges.value.length > 0) {
          params.set('probabilityRanges', encodeProbabilityRanges(probabilityRanges.value));
        }
        const newUrl = window.location.pathname + '?' + params.toString();
        window.history.replaceState(null, '', newUrl);
      };

      // --- 通知系统 ---
      const showNotification = (message, type = 'success') => {
        notification.value.message = message;
        notification.value.type = type;
        notification.value.icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        notification.value.show = true;
        setTimeout(() => {
          notification.value.show = false;
        }, 3000);
      };

      // --- 主题切换 ---
      const toggleDarkMode = () => {
        darkMode.value = !darkMode.value;
        document.body.classList.toggle('dark-mode', darkMode.value);
        persistenceManager.saveDarkMode(darkMode.value);
      };

      // --- 文件上传处理 ---
      const handleDragEnter = () => {
        isDragOver.value = true;
      };
      const handleDragOver = () => {
        isDragOver.value = true;
      };
      const handleDragLeave = () => {
        isDragOver.value = false;
      };
      const handleDrop = (e) => {
        isDragOver.value = false;
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          const file = files[0];
          if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            handleFileData(file);
          } else {
            showNotification('请上传Excel文件(.xlsx或.xls)', 'error');
          }
        }
      };

      // --- 随机数与概率 ---
      const getRandomColor = () => {
        const colors = ['#4361ee', '#4cc9f0', '#f72585', '#f8961e', '#7209b7', '#3a86ff'];
        return colors[Math.floor(Math.random() * colors.length)];
      };
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

      // --- 抽取动画 ---
      const applyAnimation = (animationClass, callback) => {
        currentAnimationClass.value = animationClass;
        if (callback) callback();
        setTimeout(() => {
          currentAnimationClass.value = '';
        }, 500);
      };

      // --- 单次抽取 ---
      const drawNumberWithAnimation = () => {
        multiDrawResults.value = [];
        const available = getAllNumbers().filter(item =>
          !usedNumbers.value.some(used => used.student_id === item.student_id)
        );
        if (available.length === 0) {
          triggerCelebration();
          return;
        }
        const animations = ['flip', 'popIn'];
        const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
        applyAnimation(randomAnimation, drawNumber);
      };
      const drawNumber = () => {
        const result = getWeightedRandomNumber();
        if (result !== null) {
          if (noRepeat.value) {
            const exists = usedNumbers.value.some(
              item => item.student_id === result.student_id
            );
            if (!exists) {
              usedNumbers.value.push(result);
            }
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

      // --- 快速抽取 ---
      const toggleContinuous = () => {
        if (isContinuous.value) {
          clearInterval(continuousIntervalId.value);
          isContinuous.value = false;
          drawNumber(); // 停止时执行单次抽取逻辑
        } else {
          isContinuous.value = true;
          continuousIntervalId.value = setInterval(() => {
            const available = getAllNumbers().filter(item =>
              !usedNumbers.value.some(used => used.student_id === item.student_id)
            );
            if (available.length === 0) {
              clearInterval(continuousIntervalId.value);
              isContinuous.value = false;
              triggerCelebration();
              return;
            }
            const result = getWeightedRandomNumber();
            if (result) {
              currentNumber.value = result.student_id;
              currentStudent.value = result;
              multiDrawResults.value = [result];
            }
          }, 30);
        }
      };

      // --- 连抽 ---
      const multiDrawWithAnimation = () => {
        const available = getAllNumbers().filter(item =>
          !usedNumbers.value.some(used => used.student_id === item.student_id)
        );
        const drawCount = Math.min(multiDrawCount.value, available.length);
        if (drawCount === 0) {
          showNotification('没有可抽取的学号了！', 'error');
          return;
        }
        applyAnimation('rollIn', multiDraw);
      };
      const multiDraw = () => {
        const available = getAllNumbers().filter(item =>
          !usedNumbers.value.some(used => used.student_id === item.student_id)
        );
        const drawCount = Math.min(multiDrawCount.value, available.length);
        if (drawCount === 0) return;
        multiDrawResults.value = [];
        showMultiEffect.value = true;
        let count = 0;
        const interval = setInterval(() => {
          if (count >= drawCount) {
            clearInterval(interval);
            setTimeout(() => {
              showMultiEffect.value = false;
              if (multiDrawResults.value.length > 0) {
                const lastResult = multiDrawResults.value[multiDrawResults.value.length - 1];
                currentNumber.value = lastResult.student_id;
                currentStudent.value = lastResult;
                if (noRepeat.value) {
                  multiDrawResults.value.forEach(result => {
                    const exists = usedNumbers.value.some(
                      item => item.student_id === result.student_id
                    );
                    if (!exists) {
                      usedNumbers.value.push(result);
                    }
                  });
                }
                if (usedNumbers.value.length === getTotalNumbers()) {
                  triggerCelebration();
                }
              }
            }, 1000);
            return;
          }
          let result;
          let attempts = 0;
          do {
            result = getWeightedRandomNumber();
            attempts++;
            if (!result || attempts > 100) break;
          } while (result && multiDrawResults.value.some(item => item.student_id === result.student_id));
          if (result) {
            multiDrawResults.value.push(result);
            multiEffectNumber.value = result.student_id;
            multiEffectName.value = result.name || '';
            count++;
          }
        }, 300);
      };

      // --- 批量抽取 ---
      const drawBatchNumbersWithAnimation = () => {
        const available = getAllNumbers().filter(item =>
          !usedNumbers.value.some(used => used.student_id === item.student_id)
        );
        const actualSize = Math.min(batchSize.value, available.length);
        if (actualSize === 0) {
          showNotification('没有可抽取的学号了！', 'error');
          return;
        }
        applyAnimation('rollIn', drawBatchNumbers);
      };
      const drawBatchNumbers = () => {
        const available = getAllNumbers().filter(item =>
          !usedNumbers.value.some(used => used.student_id === item.student_id)
        );
        const actualSize = Math.min(batchSize.value, available.length);
        if (actualSize === 0) return;
        const batch = [];
        for (let i = 0; i < actualSize; i++) {
          const result = getWeightedRandomNumber();
          if (result) {
            if (!batch.some(item => item.student_id === result.student_id)) {
              batch.push(result);
              if (noRepeat.value) {
                const exists = usedNumbers.value.some(
                  item => item.student_id === result.student_id
                );
                if (!exists) {
                  usedNumbers.value.push(result);
                }
              }
            }
          }
        }
        if (batch.length > 0) {
          multiDrawResults.value = batch;
          const lastResult = batch[batch.length - 1];
          currentNumber.value = lastResult.student_id;
          currentStudent.value = lastResult;
          if (batch.length > 3) {
            triggerCelebration(\`成功抽取\${batch.length}人！\`, batch.length * 100);
          } else if (usedNumbers.value.length === getTotalNumbers()) {
            triggerCelebration();
          }
        }
      };

      // --- 新增：惊心动魄模式 ---
      const startTensionMode = () => {
        multiDrawResults.value = [];
        const available = getAllNumbers().filter(item =>
          !usedNumbers.value.some(used => used.student_id === item.student_id)
        );
        if (available.length === 0) {
          triggerCelebration();
          return;
        }
        if (available.length === 1) {
          // 如果只有一个学生，直接显示
          const result = available[0];
          if (noRepeat.value) {
            const exists = usedNumbers.value.some(item => item.student_id === result.student_id);
            if (!exists) {
              usedNumbers.value.push(result);
            }
          }
          currentNumber.value = result.student_id;
          currentStudent.value = result;
          multiDrawResults.value = [result];
          if (usedNumbers.value.length === getTotalNumbers()) {
            triggerCelebration();
          }
          return;
        }
        // 进入闪烁状态
        isTensionMode.value = true;
        tensionCount.value = 0;
        // 从可用学生中随机选择一个作为最终结果
        const finalResult = getWeightedRandomNumber();
        // 开始快速切换名字
        tensionIntervalId.value = setInterval(() => {
          tensionCount.value++;
          // 随机显示一个可用的学生
          const randomIndex = Math.floor(Math.random() * available.length);
          currentNumber.value = available[randomIndex].student_id;
          currentStudent.value = available[randomIndex];
          // 达到最大闪烁次数后，停止并显示最终结果
          if (tensionCount.value >= tensionMaxCount.value) {
            clearInterval(tensionIntervalId.value);
            isTensionMode.value = false;
            // 应用最终结果和动画
            if (noRepeat.value) {
              const exists = usedNumbers.value.some(item => item.student_id === finalResult.student_id);
              if (!exists) {
                usedNumbers.value.push(finalResult);
              }
            }
            currentNumber.value = finalResult.student_id;
            currentStudent.value = finalResult;
            multiDrawResults.value = [finalResult];
            applyAnimation('popIn'); // 使用 popIn 动画定格
            if (usedNumbers.value.length === getTotalNumbers()) {
              triggerCelebration();
            }
          }
        }, tensionSpeed.value); // 使用 tensionSpeed 作为间隔
      };

      // --- 庆祝动画 ---
      const triggerCelebration = (message = '所有学号已抽取完成！', duration = 3000) => {
        celebrationMessage.value = message;
        showCelebration.value = true;
        setTimeout(() => {
          showCelebration.value = false;
        }, duration);
      };

      // --- 文件处理 ---
      const handleFileData = async (file) => {
        // 动态加载XLSX库
        const XLSX = await loadXLSX();
        
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const newStudents = [];
            for (let i = 0; i < jsonData.length; i++) {
              const row = jsonData[i];
              if (!row || row.length === 0) continue;
              const studentId = String(row[0]).trim();
              const name = row.length > 1 ? String(row[1]).trim() : '';
              if (studentId) {
                newStudents.push({ student_id: studentId, name });
              }
            }
            if (newStudents.length === 0) {
              showNotification('未找到有效的学生数据', 'error');
              return;
            }
            const groupIndex = studentGroups.value.findIndex(g => g.name === currentGroup.value);
            if (groupIndex >= 0) {
              const existingIds = studentGroups.value[groupIndex].students.map(s => s.student_id);
              newStudents.forEach(student => {
                if (!existingIds.includes(student.student_id)) {
                  studentGroups.value[groupIndex].students.push(student);
                }
              });
              saveGroups();
              showNotification(\`成功导入 \${newStudents.length} 条学生记录\`);
            }
          } catch (error) {
            showNotification(\`解析Excel文件失败: \${error.message}\`, 'error');
          }
        };
        reader.readAsArrayBuffer(file);
      };

      // --- 页面导航与验证 ---
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
              showNotification(\`错误：范围 \${range.start}-\${range.end} 起始值不能大于结束值\`, 'error');
              return;
            }
            if (range.start < start.value || range.end > end.value) {
              showNotification(\`错误：范围 \${range.start}-\${range.end} 超出学号范围\`, 'error');
              return;
            }
            if (range.weight <= 0) {
              showNotification(\`错误：范围 \${range.start}-\${range.end} 权重必须大于0\`, 'error');
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
      const goBack = () => {
        if (isContinuous.value) {
          clearInterval(continuousIntervalId.value);
          isContinuous.value = false;
        }
        if (isTensionMode.value) {
          clearInterval(tensionIntervalId.value);
          isTensionMode.value = false;
        }
        isSetupPage.value = true;
        updateUrlParams();
      };

      // --- 历史记录管理 ---
      const clearHistory = () => {
        usedNumbers.value = [];
        currentNumber.value = '—';
        currentStudent.value = { student_id: '', name: '' };
        multiDrawResults.value = [];
      };
      const resetUsedNumbers = () => {
        clearHistory();
        showNotification('已重置抽取记录');
      };

      // --- 文件上传辅助函数 ---
      const selectFile = () => {
        document.getElementById('fileInput').click();
      };
      const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        handleFileData(file);
        event.target.value = '';
      };

      // --- 学生分组管理 ---
      const switchGroup = (groupName) => {
        currentGroup.value = groupName;
      };
      const addNewGroup = () => {
        const name = modalConfig.value.inputValue.trim();
        if (!name) {
          showNotification('组名不能为空', 'error');
          return;
        }
        if (!studentGroups.value.some(g => g.name === name)) {
          studentGroups.value.push({ name, students: [] });
          currentGroup.value = name;
          saveGroups();
          showNotification(\`已创建新组: \${name}\`);
          closeModal();
        } else {
          showNotification('组名已存在', 'error');
        }
      };
      const renameGroup = (oldName, index) => {
        const newName = modalConfig.value.inputValue.trim();
        if (!newName) {
          showNotification('组名不能为空', 'error');
          return;
        }
        if (studentGroups.value.some((g, i) => g.name === newName && i !== index)) {
          showNotification('组名已存在', 'error');
          return;
        }
        studentGroups.value[index].name = newName;
        if (currentGroup.value === oldName) {
          currentGroup.value = newName;
        }
        saveGroups();
        showNotification(\`已将组 "\${oldName}" 重命名为 "\${newName}"\`);
        closeModal();
      };
      const deleteStudent = (index) => {
        const groupIndex = studentGroups.value.findIndex(g => g.name === currentGroup.value);
        if (groupIndex >= 0) {
          studentGroups.value[groupIndex].students.splice(index, 1);
          saveGroups();
          showNotification('学生已删除');
        }
      };
      const clearCurrentGroup = () => {
        const groupIndex = studentGroups.value.findIndex(g => g.name === currentGroup.value);
        if (groupIndex >= 0) {
          studentGroups.value[groupIndex].students = [];
          saveGroups();
          showNotification('已清空学生名单');
        }
      };
      const deleteGroup = (groupName, index) => {
        if (studentGroups.value.length <= 1) {
          showNotification('至少需要保留一个分组', 'error');
          return;
        }
        const otherIndex = index === 0 ? 1 : 0;
        const newCurrentGroup = studentGroups.value[otherIndex].name;
        studentGroups.value.splice(index, 1);
        if (currentGroup.value === groupName) {
          currentGroup.value = newCurrentGroup;
        }
        saveGroups();
        showNotification(\`已删除组: \${groupName}\`);
      };

      // --- 数据持久化 ---
      const saveGroups = () => {
        persistenceManager.saveGroups(studentGroups.value);
      };

      // --- 字号设置 ---
      const applyFontSettings = () => {
        document.documentElement.style.setProperty('--name-size', nameSize.value + 'rem');
        document.documentElement.style.setProperty('--number-size', numberSize.value + 'pt');
        showNotification('字号设置已应用');
        updateUrlParams();
      };

      // --- 概率范围调整 ---
      const adjustProbabilityRanges = () => {
        probabilityRanges.value.forEach(range => {
          if (range.start < start.value) range.start = start.value;
          if (range.end > end.value) range.end = end.value;
          if (range.start > range.end) range.start = range.end;
        });
      };

      // --- 概率范围管理 ---
      const addRange = () => {
        probabilityRanges.value.push({
          start: start.value,
          end: end.value,
          weight: 50
        });
      };
      const removeRange = (index) => {
        probabilityRanges.value.splice(index, 1);
      };

      // --- 生命周期钩子 ---
      onMounted(() => {
        try {
          // 1. 先尝试从持久化管理器加载数据
          const savedGroups = persistenceManager.loadGroups();
          if (savedGroups && savedGroups.length > 0) {
            studentGroups.value = savedGroups;
          }
          if (studentGroups.value.length === 0) {
            studentGroups.value = [{ name: '默认组', students: [] }];
          }
          const savedDarkMode = persistenceManager.loadDarkMode();
          if (savedDarkMode !== null) {
            darkMode.value = savedDarkMode;
            document.body.classList.toggle('dark-mode', darkMode.value);
          }
        } catch (e) {
          console.error('Failed to load data from persistence manager', e);
        }
        // 2. 在持久化数据加载后，检查并应用URL参数（URL优先级最高）
        const urlParams = parseUrlParams();
        // 注意：这里只应用那些在URL中明确指定的参数，可以覆盖持久化数据的默认值
        if (urlParams.start !== undefined) start.value = urlParams.start;
        if (urlParams.end !== undefined) end.value = urlParams.end;
        if (urlParams.mode) mode.value = urlParams.mode;
        if (urlParams.noRepeat !== undefined) noRepeat.value = urlParams.noRepeat;
        if (urlParams.operationMode) operationMode.value = urlParams.operationMode;
        if (urlParams.nameSize !== undefined) nameSize.value = urlParams.nameSize;
        if (urlParams.numberSize !== undefined) numberSize.value = urlParams.numberSize;
        if (urlParams.multiDrawCount !== undefined) multiDrawCount.value = urlParams.multiDrawCount;
        if (urlParams.batchSize !== undefined) batchSize.value = urlParams.batchSize;
        if (urlParams.tensionMaxCount !== undefined) tensionMaxCount.value = urlParams.tensionMaxCount;
        if (urlParams.tensionSpeed !== undefined) tensionSpeed.value = urlParams.tensionSpeed;
        if (urlParams.probabilityRanges.length > 0) {
          probabilityRanges.value = urlParams.probabilityRanges;
        }
        // 3. 初始化逻辑（如添加默认概率范围、应用字体）
        if (probabilityRanges.value.length === 0) {
          addRange();
        }
        applyFontSettings();
        // 4. 最后，确保URL与当前状态完全同步（处理那些URL中没有但需要初始化的参数）
        updateUrlParams();
      });

      // --- 侦听器 ---
      watch([
        start, end, mode, noRepeat, operationMode, nameSize, numberSize, multiDrawCount, batchSize, tensionMaxCount, tensionSpeed, probabilityRanges
      ], updateUrlParams, { deep: true });
      watch([start, end], adjustProbabilityRanges);

      // --- 新增的模态框方法 ---
      const showModalWithConfig = (config) => {
        modalConfig.value = { ...config };
        // 如果需要输入，清空之前的输入值
        if (config.inputRequired) {
          modalConfig.value.inputValue = '';
        }
        showModal.value = true;
        // 在模态框打开后，延迟聚焦输入框
        if (config.inputRequired) {
          setTimeout(() => {
            if (modalInputRef.value) {
              modalInputRef.value.focus();
            }
          }, 300);
        }
      };
      const closeModal = () => {
        showModal.value = false;
      };
      const showDeleteGroupModal = (groupName, index) => {
        if (studentGroups.value.length <= 1) {
          showNotification('至少需要保留一个分组', 'error');
          return;
        }
        showModalWithConfig({
          title: '删除分组',
          message: \`确定要删除"\${groupName}"组吗？此操作不可撤销。\`,
          confirmText: '删除',
          danger: true,
          onConfirm: () => {
            deleteGroup(groupName, index);
            closeModal();
          }
        });
      };
      const showClearGroupModal = () => {
        showModalWithConfig({
          title: '清空名单',
          message: \`确定要清空"\${currentGroup.value}"组的所有学生吗？\`,
          confirmText: '清空',
          danger: true,
          onConfirm: () => {
            clearCurrentGroup();
            closeModal();
          }
        });
      };
      const showResetHistoryModal = () => {
        showModalWithConfig({
          title: '重置记录',
          message: '确定要重置已抽取记录吗？',
          confirmText: '重置',
          danger: true,
          onConfirm: () => {
            resetUsedNumbers();
            closeModal();
          }
        });
      };
      const showClearHistoryModal = () => {
        showModalWithConfig({
          title: '清除历史',
          message: '确定要清除所有历史记录吗？',
          confirmText: '清除',
          danger: true,
          onConfirm: () => {
            clearHistory();
            closeModal();
          }
        });
      };
      const showAddGroupModal = () => {
        showModalWithConfig({
          title: '新建组',
          message: '请输入新组名称：',
          inputRequired: true,
          inputPlaceholder: '例如：三年二班',
          confirmText: '创建',
          danger: false,
          onConfirm: addNewGroup
        });
      };
      const showRenameGroupModal = (groupName, index) => {
        showModalWithConfig({
          title: '重命名组',
          message: \`请输入 "\${groupName}" 的新名称：\`,
          inputRequired: true,
          inputPlaceholder: '例如：三年三班',
          confirmText: '重命名',
          danger: false,
          onConfirm: () => renameGroup(groupName, index)
        });
      };

      // --- 返回供模板使用的数据和方法 ---
      return {
        // 状态
        isDragOver, isSetupPage, darkMode, showAdvanced, showBatchSettings,
        showMultiEffect, showCelebration, isContinuous, currentAnimationClass,
        // 新增：惊心动魄模式
        isTensionMode, tensionMaxCount, tensionSpeed,
        // 核心数据
        operationMode, start, end, mode, noRepeat, currentNumber, currentStudent,
        usedNumbers, multiDrawResults, studentGroups, currentGroup, probabilityRanges,
        celebrationMessage, notification, multiEffectNumber, multiEffectName,
        // UI设置
        nameSize, numberSize, multiDrawCount, batchSize,
        // 计算属性
        currentStudents, getTotalNumbers,
        // 方法
        showNotification, toggleDarkMode, handleDragEnter, handleDragOver,
        handleDragLeave, handleDrop, getRandomColor, getWeightedRandomNumber,
        applyAnimation, drawNumberWithAnimation, drawNumber, toggleContinuous,
        multiDrawWithAnimation, multiDraw, drawBatchNumbersWithAnimation,
        drawBatchNumbers, triggerCelebration, handleFileData, validateAndNavigate,
        goBack, resetUsedNumbers, clearHistory, selectFile, handleFileUpload,
        switchGroup, addNewGroup, renameGroup, deleteStudent, clearCurrentGroup, saveGroups,
        addRange, removeRange, applyFontSettings, adjustProbabilityRanges, deleteGroup,
        // 新增：惊心动魄模式方法
        startTensionMode,
        // 新增模态框方法
        showModalWithConfig, closeModal, showDeleteGroupModal, showClearGroupModal,
        showResetHistoryModal, showClearHistoryModal, showAddGroupModal, showRenameGroupModal,
        // 模态框引用
        modalInputRef
      };
    }
  });
}