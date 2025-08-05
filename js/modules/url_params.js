// url_params 模块
// --- URL参数处理 ---
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
            batchSize: params.has('batchSize') ? parseInt(params.get('batchSize')) : 1
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
          const newUrl = window.location.pathname + '?' + params.toString();
          window.history.replaceState(null, '', newUrl);
        };
        // --- 通知系统 ---