// ==================== 全局变量声明 ====================
const audio = document.getElementById('audio-player');
const playBtn = document.querySelector('.play-btn');
const progressBar = document.querySelector('.progress-bar');
const progress = document.querySelector('.progress');
const currentTimeEl = document.querySelector('.current-time');
const durationEl = document.querySelector('.duration');
const volumeSlider = document.querySelector('.volume-slider');
const albumArt = document.querySelector('.album-art');
const spectrumCanvas = document.getElementById('spectrum');
const spectrumCtx = spectrumCanvas.getContext('2d');
const particleCanvas = document.getElementById('particles');
const pCtx = particleCanvas.getContext('2d');
const neonBar = document.querySelector('.neon-bar');

// 音频分析相关
let audioCtx, analyser, dataArray;
const smoothing = 0.7;
const previousData = [];

// 粒子系统
const particles = [];

// ==================== 初始化函数 ====================
function init() {
    // 初始化Canvas尺寸
    spectrumCanvas.width = spectrumCanvas.offsetWidth;
    spectrumCanvas.height = spectrumCanvas.offsetHeight;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;

    // 初始化粒子系统
    initParticles();
    
    // 设置默认音量
    audio.volume = 0.7;
    volumeSlider.value = 70;
    updateVolumeIcon();
    
    // 启动动画
    animateParticles();
}

// ==================== 音乐播放控制 ====================
function setupAudioControls() {
    // 单一播放按钮事件监听
    playBtn.addEventListener('click', togglePlay);
    
    // 进度条控制
    progressBar.addEventListener('click', (e) => {
        const seekTime = (e.offsetX / progressBar.clientWidth) * audio.duration;
        audio.currentTime = seekTime;
    });
    
    // 音量控制
    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value / 100;
        updateVolumeIcon();
    });
    
    // 音频事件监听
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
}

function togglePlay() {
    if (audio.paused) {
        audio.play();
        albumArt.classList.add('playing');
        if (!audioCtx) initAudioAnalyser();
    } else {
        audio.pause();
        albumArt.classList.remove('playing');
    }
    updatePlayIcon();
}

function updatePlayIcon() {
    playBtn.innerHTML = audio.paused 
        ? '<i class="fas fa-play"></i>' 
        : '<i class="fas fa-pause"></i>';
}

function updateProgress() {
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
}

function updateDuration() {
    durationEl.textContent = formatTime(audio.duration);
}

function updateVolumeIcon() {
    const volume = audio.volume;
    const icon = document.querySelector('.volume-icon');
    icon.className = `fas fa-volume-${
        volume === 0 ? 'mute' : 
        volume < 0.33 ? 'off' : 
        volume < 0.66 ? 'down' : 'up'
    } volume-icon`;
    

}

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

// ==================== 霓虹效果 ====================
function setupNeonEffects() {
    // 鼠标跟随效果
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        neonBar.style.opacity = 0.3 + x * 0.2;
        neonBar.style.backgroundPosition = `${x * 100}% 0`;
    });

    // 随机动画延迟
    document.querySelectorAll('.neon-text').forEach(text => {
        text.setAttribute('data-text', text.textContent);
        text.style.animationDelay = `${Math.random() * 2}s`;
    });
}

// ==================== 工具函数 ====================
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ==================== 窗口大小调整 ====================
function handleResize() {
    spectrumCanvas.width = spectrumCanvas.offsetWidth;
    spectrumCanvas.height = spectrumCanvas.offsetHeight;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}

// ==================== 初始化执行 ====================
window.addEventListener('load', () => {
    init();
    setupAudioControls();
    setupNeonEffects();
    window.addEventListener('resize', handleResize);
    
    // 单次点击初始化（解决浏览器自动播放限制）
    document.body.addEventListener('click', function initOnClick() {
        if (!audioCtx) initAudioAnalyser();
        this.removeEventListener('click', initOnClick);
    }, { once: true });
});