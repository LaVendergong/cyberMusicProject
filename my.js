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



//音乐结束

audio.addEventListener('waiting', () => {
    durationEl.innerHTML = '0:00'; // 更新总时长
})

audio.addEventListener('loadedmetadata', () => {
    durationEl.innerHTML = formatTime(audio.duration); // 更新总时长
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
    analyser.fftSize = 1024;
    // 增加平滑常数，使低频响应更平滑
    analyser.smoothingTimeConstant = 0.6;  // 从0.65改为0.75
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    dataArray = new Uint8Array(analyser.frequencyBinCount);

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

// 创建波浪效果数据
const wavePoints = [];
const WAVE_POINTS_COUNT = 100;
for (let i = 0; i < WAVE_POINTS_COUNT; i++) {
    wavePoints.push({
        x: i * (spectrumCanvas.width / WAVE_POINTS_COUNT),
        y: spectrumCanvas.height / 2,
        amplitude: 0,
        speed: 0.05 + Math.random() * 0.05
    });
}

// 主绘制函数
function drawSpectrum() {
    requestAnimationFrame(drawSpectrum);
    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);
    spectrumCtx.clearRect(0, 0, spectrumCanvas.width, spectrumCanvas.height);

    // 绘制背景
    const gradient = spectrumCtx.createLinearGradient(0, 0, 0, spectrumCanvas.height);
    gradient.addColorStop(0, 'rgba(0, 20, 40, 0.95)');
    gradient.addColorStop(1, 'rgba(0, 10, 20, 0.95)');
    spectrumCtx.fillStyle = gradient;
    spectrumCtx.fillRect(0, 0, spectrumCanvas.width, spectrumCanvas.height);

    // 绘制网格
    drawGrid();

    // 绘制频谱柱状图
    drawBars();

    

    // 绘制粒子效果
    drawParticles();

    // 绘制扫描线
    drawScanlines();
}

// 绘制动态网格
function drawGrid() {
    const time = Date.now() * 0.001;
    spectrumCtx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    spectrumCtx.lineWidth = 1;

    // 水平线
    for (let y = 0; y < spectrumCanvas.height; y += 20) {
        const offset = Math.sin(time + y * 0.05) * 5;
        spectrumCtx.beginPath();
        spectrumCtx.moveTo(0, y + offset);
        spectrumCtx.lineTo(spectrumCanvas.width, y - offset);
        spectrumCtx.stroke();
    }

    // 垂直线
    for (let x = 0; x < spectrumCanvas.width; x += 20) {
        const offset = Math.cos(time + x * 0.05) * 5;
        spectrumCtx.beginPath();
        spectrumCtx.moveTo(x + offset, 0);
        spectrumCtx.lineTo(x - offset, spectrumCanvas.height);
        spectrumCtx.stroke();
    }
}

// 绘制频谱柱状图
function drawBars() {
    const barCount = 200;
    const barWidth = spectrumCanvas.width / barCount;
    const step = Math.floor(dataArray.length / barCount);

    for (let i = 0; i < barCount; i++) {
        // 获取频段值
        let value = Math.max(...dataArray.slice(i * step, (i + 1) * step));
        
        // 频率响应曲线调整
        // 低频段压制，中频段保持，高频段适度提升
        const frequencyWeight = (i / barCount);
        let frequencyMultiplier;
        if (frequencyWeight < 0.2) {
            // 低频段（0-20%）渐进压制
            frequencyMultiplier = 0.5 + frequencyWeight * 2;
        } else if (frequencyWeight < 0.6) {
            // 中频段（20-60%）保持正常
            frequencyMultiplier = 1;
        } else {
            // 高频段（60-100%）适度提升
            frequencyMultiplier = 1 + (frequencyWeight - 0.6) * 0.8; // 降低高频增益
        }
        
        value = value * frequencyMultiplier;
        
        // 对整体响应进行压缩
        const compressionThreshold = 200; // 压缩阈值
        if (value > compressionThreshold) {
            // 超过阈值的部分进行对数压缩
            value = compressionThreshold + (value - compressionThreshold) * 0.3;
        }
        
        // 非线性映射调整
        const normalizedValue = Math.pow(value / 255, 1.2); // 增大指数以降低整体响应
        
        // 降低整体高度
        const barHeight = normalizedValue * spectrumCanvas.height * 0.75; // 从0.9降到0.75

        // 颜色调整 - 降低高频亮度
        const hue = (180 + i / barCount * 60 + Date.now() * 0.05) % 360;
        const saturation = 80 + normalizedValue * 15;
        const lightness = 40 + normalizedValue * 20; // 降低整体亮度

        // 主柱体
        spectrumCtx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.85)`;
        spectrumCtx.fillRect(
            i * barWidth,
            spectrumCanvas.height - barHeight,
            barWidth * 0.9,
            barHeight
        );

        // 发光效果
        const glow = spectrumCtx.createLinearGradient(
            i * barWidth,
            spectrumCanvas.height - barHeight,
            i * barWidth,
            spectrumCanvas.height
        );
        glow.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.5)`);
        glow.addColorStop(1, 'transparent');
        spectrumCtx.fillStyle = glow;
        spectrumCtx.fillRect(
            i * barWidth,
            spectrumCanvas.height - barHeight * 1.2,
            barWidth * 0.9,
            barHeight * 1.2
        );

        // 顶部光点效果 - 降低大小
        spectrumCtx.fillStyle = `hsla(${hue}, 100%, 70%, 0.8)`;
        spectrumCtx.beginPath();
        spectrumCtx.arc(
            i * barWidth + barWidth * 0.45,
            spectrumCanvas.height - barHeight,
            barWidth * 0.15, // 从0.2降到0.15
            0,
            Math.PI * 2
        );
        spectrumCtx.fill();
    }
}



// 频谱粒子系统
const spectrumParticles = [];
const PARTICLE_COUNT = 50;  // 增加粒子数量

// 修改粒子的初始化属性
for (let i = 0; i < PARTICLE_COUNT; i++) {
    spectrumParticles.push({
        x: Math.random() * spectrumCanvas.width,
        y: Math.random() * spectrumCanvas.height,
        size: Math.random() * 2 + 1,  // 稍微减小粒子大小
        speedX: (Math.random() - 0.5) * 3,  // 增加水平速度
        speedY: (Math.random() - 0.5) * 3,  // 增加垂直速度
        hue: Math.random() * 60 + 180,
        bounceDecay: 0.8  // 添加反弹衰减系数
    });
}

// 修改粒子绘制和更新函数
function drawParticles() {
    const barWidth = spectrumCanvas.width / 200;  // 与drawBars中的barCount保持一致

    spectrumParticles.forEach(particle => {
        // 获取粒子当前位置对应的频谱柱体高度
        const barIndex = Math.floor(particle.x / barWidth);
        const value = dataArray[Math.min(barIndex * Math.floor(dataArray.length / 200), dataArray.length - 1)] || 0;
        const normalizedValue = Math.pow(value / 255, 1.2);
        const barHeight = normalizedValue * spectrumCanvas.height * 0.75;
        
        // 更新位置
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // 水平边界碰撞
        if (particle.x <= 0 || particle.x >= spectrumCanvas.width) {
            particle.speedX *= -particle.bounceDecay;
            particle.x = Math.max(0, Math.min(particle.x, spectrumCanvas.width));
        }
        
        // 顶部边界碰撞
        if (particle.y <= 0) {
            particle.speedY *= -particle.bounceDecay;
            particle.y = 0;
        }
        
        // 与频谱柱体的碰撞检测 - 修改这部分
        const bottomLimit = spectrumCanvas.height - barHeight;
        if (particle.y >= bottomLimit) {
            // 当粒子触碰到柱体或底部时
            if (barHeight > 0) {  // 如果有音频信号
                // 根据音频强度决定反弹力度
                const bounceForce = Math.max(0.5, normalizedValue * 2);
                particle.speedY = -Math.abs(particle.speedY) * particle.bounceDecay * bounceForce;
                particle.y = bottomLimit;
                // 添加水平速度变化
                particle.speedX += (Math.random() - 0.5) * normalizedValue * 2;
            } else if (particle.y >= spectrumCanvas.height) {
                // 如果没有音频信号且触底
                particle.y = spectrumCanvas.height;
                particle.speedY *= -particle.bounceDecay;
            }
        }
        
        // 添加重力效果
        particle.speedY += 0.01;  // 略微增加重力
        
        // 限制最大速度
        const maxSpeed = 8;  // 增加最大速度限制
        const currentSpeed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
        if (currentSpeed > maxSpeed) {
            const scale = maxSpeed / currentSpeed;
            particle.speedX *= scale;
            particle.speedY *= scale;
        }
        
        // 绘制粒子部分保持不变
        const frequency = value / 255;
        spectrumCtx.beginPath();
        spectrumCtx.arc(
            particle.x,
            particle.y,
            particle.size * (1 + frequency * 0.5),
            0,
            Math.PI * 2
        );
        
        const speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
        const dynamicHue = (particle.hue + speed * 5) % 360;
        spectrumCtx.fillStyle = `hsla(${dynamicHue}, 100%, 70%, ${0.3 + frequency * 0.5})`;
        spectrumCtx.fill();
    });
}

// 绘制扫描线效果
function drawScanlines() {
    const scanLineCount = 50;
    const scanLineHeight = spectrumCanvas.height / scanLineCount;
    
    for (let i = 0; i < scanLineCount; i++) {
        const y = i * scanLineHeight;
        const alpha = 0.03 + Math.sin(Date.now() * 0.001 + i * 0.1) * 0.02;
        
        spectrumCtx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        spectrumCtx.fillRect(0, y, spectrumCanvas.width, 1);
    }
}

// ==================== 粒子系统 ====================

const particleCanvas = document.getElementById('particles');
const pCtx = particleCanvas.getContext('2d');
particleCanvas.width = window.innerWidth;
particleCanvas.height = window.innerHeight;

// 背景粒子系统
const backgroundParticles = [];  // 改名：particles -> backgroundParticles

function initParticles() {
    for (let i = 0; i < 150; i++) {
        backgroundParticles.push({  // 使用新名称
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
    
    backgroundParticles.forEach(p => {  // 使用新名称
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

