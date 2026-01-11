// probability_ranges 模块
// --- 概率范围调整 ---
        // 调整概率范围，确保其在学号范围内
        const adjustProbabilityRanges = () => {
          probabilityRanges.value.forEach(range => {
            if (range.start < start.value) range.start = start.value;
            if (range.end > end.value) range.end = end.value;
            if (range.start > range.end) range.start = range.end;
          });
        };
        // --- 概率范围管理 ---