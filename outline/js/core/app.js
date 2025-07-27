/* 应用入口文件 */
import { createApp, ref, computed, onMounted, watch, nextTick } from Vue;
import { state } from './state.js';
import { config } from './config.js';
import * as components from '../components/index.js';
import * as utils from '../utils/index.js';
import * as features from '../features/index.js';

// 应用初始化
const app = createApp({
    setup() {
        return {
            ...state,
            ...config,
            ...components,
            ...utils,
            ...features
        };
    }
});

app.mount('#app');
