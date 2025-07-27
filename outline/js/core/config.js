const parseUrlParams = () => {
          const params = new URLSearchParams(window.location.search);
          return {
            start: params.has('start') ? parseInt(params.get('start')) : 1,
            end: params.has('end') ? parseInt(params.get('end')) : 40,
            mode: params.get('mode') || 'd',
            noRepeat: params.has('noRepeat') ? params.get('noRepeat') === 'true' : true,
            operationMode: params.get('operationMode') || 'range',
            globalFont: params.get('globalFont') || 'Inter',
            numberFont: params.get('numberFont') || 'Arial',
            nameSize: params.has('nameSize') ? parseFloat(params.get('nameSize')) : 5,
            numberSize: params.has('numberSize') ? parseInt(params.get('numberSize')) : 80,
            multiDrawCount: params.has('multiDrawCount') ? parseInt(params.get('multiDrawCount')) : 5,
            batchSize: params.has('batchSize') ? parseInt(params.get('batchSize')) : 1
          };
        };

        const urlParams = parseUrlParams();