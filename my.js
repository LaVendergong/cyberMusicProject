//这是管理播放功能的js代码
let audioCtx, analyser, dataArray;
const smoothing = 0.7;
const previousData = [];
//播放功能
const playbtn = document.querySelector('.play-btn')
const audio = document.querySelector('#audio-player')

playbtn.addEventListener('click', () => {
    playbtn.classList.toggle('playing')
    
    if (playbtn.classList.contains('playing')) {
        audio.play() 
        
        playbtn.innerHTML = '<i class="fas fa-pause"></i>'
        if (!audioCtx) initAudioAnalyser()
    } else {
        audio.pause() // 暂停音频
        playbtn.innerHTML = '<i class="fas fa-play"></i>'
         // 恢复播放按钮的初始状态，显示播放符号
    }
    
}) 

//音量控制
const volumeSlider = document.querySelector('.volume-control input')
const volumeIcon = document.querySelector('.volume-icon')

volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value / 100 // 调整音量
    updateVolumeIcon() // 更新音量图标
})
function updateVolumeIcon() {
    const volume = audio.volume;
    const icon = document.querySelector('.volume-icon');
    icon.className = `fas fa-volume-${
        volume === 0 ? 'mute' : 
        volume < 0.1 ? 'off' : 
        volume < 0.5 ? 'down' : 'up'
    } volume-icon`;
    
}

//进度条
const progressBar = document.querySelector('.progress-bar')
const currentTimeEl = document.querySelector('.current-time')
const durationEl = document.querySelector('.duration')
//进度条实时更新
audio.addEventListener('timeupdate', () => {
    const currentTime = audio.currentTime
    const duration = audio.duration
    const progressPercent = (currentTime / duration) * 100 
    progressBar.children[0].style.width = `${progressPercent}%` // 更新进度条宽度
    currentTimeEl.innerHTML = formatTime(currentTime) // 更新当前时间
    durationEl.innerHTML = formatTime(duration) // 更新总时长
})

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

//进度条点击
progressBar.addEventListener('click', (e) => {

    const seekTime = (e.offsetX / progressBar.clientWidth) * audio.duration;
    audio.currentTime = seekTime;    
})

//音频频谱图
const spectrumCanvas = document.querySelector('#spectrum')
const spectrumCtx = spectrumCanvas.getContext('2d')

spectrumCanvas.width = spectrumCanvas.offsetWidth;
spectrumCanvas.height = spectrumCanvas.offsetHeight;



// ==================== 频谱分析系统 ====================
function initAudioAnalyser() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256; // 保持较低的FFT大小以获得更明显的柱体
    analyser.smoothingTimeConstant = 0.7; // 适当平滑
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    // 初始化历史数据
    for (let i = 0; i < analyser.frequencyBinCount; i++) {
        previousData[i] = 0;
    }
}
    
    // 开始绘制频谱
    drawSpectrum();

// 在全局变量区域添加横线数据存储
const horizontalLines = Array(80).fill().map(() => ({
    y: 0,
    targetY: 0,
    speed: 0
}));


function drawSpectrum() {
    requestAnimationFrame(drawSpectrum);
    
    if (!analyser) return;
    
    analyser.getByteFrequencyData(dataArray);
    spectrumCtx.clearRect(0, 0, spectrumCanvas.width, spectrumCanvas.height);
    
    const barCount = 80;
    const step = Math.floor(analyser.frequencyBinCount / barCount);
    const barWidth = spectrumCanvas.width / barCount;
    const gravity = 0.1; // 下落速度
    const friction = 0.8; // 摩擦力
    
    // 绘制背景网格
    spectrumCtx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    spectrumCtx.lineWidth = 1;
    for (let y = 0; y < spectrumCanvas.height; y += 20) {
        spectrumCtx.beginPath();
        spectrumCtx.moveTo(0, y);
        spectrumCtx.lineTo(spectrumCanvas.width, y);
        spectrumCtx.stroke();
    }

    for (let i = 0; i < barCount; i++) {
        const index = i * step;
        let value = Math.max(...dataArray.slice(index, index + step));
        value = Math.pow(value / 255, 1.5) * 255;
        value = Math.max(value, previousData[i] * 0.7);
        previousData[i] = value;
        
        const barHeight = (value / 255) * spectrumCanvas.height;
        const hue = 200 + (i / barCount * 60);
        const x = i * barWidth;
        
        // 1. 绘制柱体
        spectrumCtx.fillStyle = `hsla(${hue}, 100%, 70%, 0.8)`;
        spectrumCtx.fillRect(x, spectrumCanvas.height - barHeight, barWidth * 0.8, barHeight);
        
        // 2. 更新横线物理效果
        const line = horizontalLines[i];
        line.targetY = spectrumCanvas.height - barHeight - 15; // 保持在柱子上方15px
        
        // 物理模拟：弹簧+重力效果
        const acceleration = (line.targetY - line.y) * 0.1;
        line.speed += acceleration;
        line.speed *= friction; // 摩擦力减速
        line.y += line.speed;
        
        // 3. 绘制横线（带动态拖影效果）
        spectrumCtx.strokeStyle = `hsla(${hue}, 100%, 90%, 0.8)`;
        spectrumCtx.lineWidth = 2;
        
        // 横线主体
        spectrumCtx.beginPath();
        spectrumCtx.moveTo(x, line.y);
        spectrumCtx.lineTo(x + barWidth * 0.8, line.y);
        spectrumCtx.stroke();
        
        // 拖影效果（下落痕迹）
        if (line.speed > 0.5) {
            spectrumCtx.strokeStyle = `hsla(${hue}, 100%, 90%, 0.3)`;
            spectrumCtx.beginPath();
            spectrumCtx.moveTo(x, line.y + 5);
            spectrumCtx.lineTo(x + barWidth * 0.8, line.y + 5);
            spectrumCtx.stroke();
        }
        
        // 4. 顶部高光
        spectrumCtx.fillStyle = `hsla(${hue}, 100%, 90%, 0.6)`;
        spectrumCtx.fillRect(
            x + barWidth * 0.1,
            spectrumCanvas.height - barHeight,
            barWidth * 0.6,
            2
        );
    }
}
// 绘制扫描线
spectrumCtx.strokeStyle = `rgba(0, 240, 255, ${0.1 + Math.random() * 0.05})`;
spectrumCtx.lineWidth = 1 + Math.random();
spectrumCtx.beginPath();
spectrumCtx.moveTo(0, spectrumCanvas.height * (0.3 + Math.random() * 0.4));
spectrumCtx.lineTo(spectrumCanvas.width, spectrumCanvas.height * (0.3 + Math.random() * 0.4));
spectrumCtx.stroke();


// ==================== 粒子系统 ====================

const particleCanvas = document.getElementById('particles');
const pCtx = particleCanvas.getContext('2d');
particleCanvas.width = window.innerWidth;
particleCanvas.height = window.innerHeight;
const particles = [];
function initParticles() {
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * particleCanvas.width,
            y: Math.random() * particleCanvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            color: `hsla(${Math.random() * 60 + 200}, 100%, 70%, ${Math.random() * 0.5 + 0.3})`
        });
    }
}

function animateParticles() {
    pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    particles.forEach(p => {
        pCtx.fillStyle = p.color;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        pCtx.fill();

        // 更新位置并检查边界
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > particleCanvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > particleCanvas.height) p.speedY *= -1;
    });

    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();