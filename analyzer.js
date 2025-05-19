// 音频分析器
let analyser = null;
let audioContext = null;
let source = null;

// 初始化音频分析器
function initAnalyzer() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const audioElement = document.getElementById('audio-player');
    if (!audioElement) return null;
    
    if (source) {
        source.disconnect();
    }
    
    source = audioContext.createMediaElementSource(audioElement);
    source.connect(audioContext.destination);
    
    if (analyser) {
        analyser.disconnect();
    }
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    
    return analyser;
}

// 获取音频数据
function getAudioData() {
    if (!analyser) return null;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
}

// 清理分析器
function cleanupAnalyzer() {
    if (analyser) {
        analyser.disconnect();
        analyser = null;
    }
    if (source) {
        source.disconnect();
        source = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
}

// 导出函数
window.AudioAnalyzer = {
    init: initAnalyzer,
    getData: getAudioData,
    cleanup: cleanupAnalyzer
};

// 定义 process 函数
function process() {
    // 确保 analyser 不为 null
    if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        // 处理频率数据
        // ...
    }
}

// 调用 process 函数
process();