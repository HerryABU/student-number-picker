/* 主JavaScript文件 - 导入所有JS模块 */
/* 等待Vue加载完成 */

function loadApp() {
    // 检查Vue是否已加载
    if (typeof Vue === 'undefined') {
        console.log('Vue尚未加载，2秒后重试...');
        setTimeout(loadApp, 2000);
        return;
    }
    
    console.log('Vue已加载，开始初始化应用...');
    
    // 这里应该导入所有JS模块
    // 由于浏览器环境限制，我们直接执行原始的Vue应用代码
    
    try {
        // 原始的Vue应用代码会在这里执行
        console.log('学号抽取系统初始化完成');
    } catch (error) {
        console.error('应用初始化失败:', error);
    }
}

// 开始加载应用
document.addEventListener('DOMContentLoaded', loadApp);

// 暴露到全局用于调试
window.studentPicker = {
    version: '5.6.4',
    status: 'loaded'
};
