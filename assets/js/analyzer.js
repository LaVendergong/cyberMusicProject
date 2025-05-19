// 假设这里是创建 AudioContext 和 AnalyserNode 的代码
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();

// 确保音频源连接到 AnalyserNode
const audioElement = document.getElementById('audio-player');
const source = audioContext.createMediaElementSource(audioElement);
source.connect(analyser);
analyser.connect(audioContext.destination);

// 音频分析器
const audioAnalyzer = {
    analyser: null,
    dataArray: null,
    bufferLength: 0,
    
    init(audioContext, source) {
        if (this.analyser) {
            this.analyser.disconnect();
        }
        
        this.analyser = audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        source.connect(this.analyser);
        
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
    },
    
    getFrequencyData() {
        if (!this.analyser) return null;
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    },
    
    getWaveformData() {
        if (!this.analyser) return null;
        this.analyser.getByteTimeDomainData(this.dataArray);
        return this.dataArray;
    }
};

// 导出分析器
window.AudioAnalyzer = audioAnalyzer;

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