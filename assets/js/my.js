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

    // 获取当前主题颜色
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--primary-color').trim();
    const secondaryColor = computedStyle.getPropertyValue('--secondary-color').trim();
    const backgroundColor = computedStyle.getPropertyValue('--background-color').trim();

    // 使用主题颜色创建渐变
    const gradient = spectrumCtx.createLinearGradient(0, 0, 0, spectrumCanvas.height);
    gradient.addColorStop(0, `${secondaryColor}95`); // 95表示透明度0.95
    gradient.addColorStop(1, `${backgroundColor}95`);
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
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--primary-color').trim();
    
    spectrumCtx.strokeStyle = `${primaryColor}20`; // 20表示透明度0.12
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
        bounceDecay: 0.8  // 添加反弹衰减系数
    });
}

// 修改粒子绘制和更新函数
function drawParticles() {
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--primary-color').trim();
    const secondaryColor = computedStyle.getPropertyValue('--secondary-color').trim();
    const accentColor = computedStyle.getPropertyValue('--accent-color').trim();
    
    const barWidth = spectrumCanvas.width / 200;  // 与drawBars中的barCount保持一致

    spectrumParticles.forEach(particle => {
        // 获取粒子当前位置对应的频谱柱体高度
        const barIndex = Math.floor(particle.x / barWidth);
        const value = dataArray[Math.min(barIndex * Math.floor(dataArray.length / 200), dataArray.length - 1)] || 0;
        const normalizedValue = Math.pow(value / 255, 1.2);
        const barHeight = normalizedValue * spectrumCanvas.height * 0.75;
        
        // 计算频率值
        const frequency = value / 255;
        
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
        
        // 与频谱柱体的碰撞检测
        const bottomLimit = spectrumCanvas.height - barHeight;
        if (particle.y >= bottomLimit) {
            if (barHeight > 0) {  // 如果有音频信号
                const bounceForce = Math.max(0.5, normalizedValue * 2);
                particle.speedY = -Math.abs(particle.speedY) * particle.bounceDecay * bounceForce;
                particle.y = bottomLimit;
                particle.speedX += (Math.random() - 0.5) * normalizedValue * 2;
            } else if (particle.y >= spectrumCanvas.height) {
                particle.y = spectrumCanvas.height;
                particle.speedY *= -particle.bounceDecay;
            }
        }
        
        // 添加重力效果
        particle.speedY += 0.01;
        
        // 限制最大速度
        const maxSpeed = 8;
        const currentSpeed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
        if (currentSpeed > maxSpeed) {
            const scale = maxSpeed / currentSpeed;
            particle.speedX *= scale;
            particle.speedY *= scale;
        }
        
        // 使用主题颜色绘制粒子
        spectrumCtx.beginPath();
        spectrumCtx.arc(
            particle.x,
            particle.y,
            particle.size * (1 + frequency * 0.5),
            0,
            Math.PI * 2
        );
        
        // 根据粒子速度和音频强度混合主题颜色
        const speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
        const colorMix = speed / maxSpeed; // 0-1之间的值
        const audioIntensity = frequency * 0.7 + 0.3; // 确保至少有0.3的基础亮度

        // 在主色调和强调色之间进行插值
        let particleColor;
        if (colorMix < 0.5) {
            // 在primaryColor和secondaryColor之间插值
            particleColor = interpolateColors(primaryColor, secondaryColor, colorMix * 2);
        } else {
            // 在secondaryColor和accentColor之间插值
            particleColor = interpolateColors(secondaryColor, accentColor, (colorMix - 0.5) * 2);
        }

        spectrumCtx.fillStyle = `${particleColor}${Math.floor((0.3 + frequency * 0.5) * 255).toString(16).padStart(2, '0')}`;
        spectrumCtx.fill();
    });
}

// 添加颜色插值辅助函数
function interpolateColors(color1, color2, factor) {
    // 解析颜色
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    // 线性插值
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    // 转换回十六进制
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// 绘制扫描线效果
function drawScanlines() {
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--primary-color').trim();
    
    const scanLineCount = 50;
    const scanLineHeight = spectrumCanvas.height / scanLineCount;
    
    for (let i = 0; i < scanLineCount; i++) {
        const y = i * scanLineHeight;
        const alpha = 0.03 + Math.sin(Date.now() * 0.001 + i * 0.1) * 0.02;
        
        spectrumCtx.fillStyle = `${primaryColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
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

// ==================== 键盘控制系统 ====================
let lastVolume = audio.volume; // 存储上次的音量，用于静音切换

// 键盘控制功能
document.addEventListener('keydown', (e) => {
    // 防止按键默认行为（例如空格键滚动页面）
    if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
    
    switch(e.code) {
        case 'Space': // 空格键控制播放/暂停
            if(playbtn.classList.contains('playing')) {
                audio.pause();
                playbtn.classList.remove('playing');
                playbtn.innerHTML = '<i class="fas fa-play"></i>';
            } else {
                audio.play();
                playbtn.classList.add('playing');
                playbtn.innerHTML = '<i class="fas fa-pause"></i>';
                if (!audioCtx) initAudioAnalyser();
            }
            break;
            
        case 'ArrowLeft': // 左方向键快退5秒
            audio.currentTime = Math.max(0, audio.currentTime - 5);
            break;
            
        case 'ArrowRight': // 右方向键快进5秒
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
            break;
            
        case 'ArrowUp': // 上方向键增加音量
            audio.volume = Math.min(1, audio.volume + 0.1);
            volumeSlider.value = audio.volume * 100;
            updateVolumeIcon();
            break;
            
        case 'ArrowDown': // 下方向键减小音量
            audio.volume = Math.max(0, audio.volume - 0.1);
            volumeSlider.value = audio.volume * 100;
            updateVolumeIcon();
            break;
            
        case 'KeyM': // M键控制静音
            if(audio.volume > 0) {
                lastVolume = audio.volume;
                audio.volume = 0;
                volumeSlider.value = 0;
            } else {
                audio.volume = lastVolume;
                volumeSlider.value = lastVolume * 100;
            }
            updateVolumeIcon();
            break;

        case 'KeyA': // A键切换上一首
            const prevBtn = document.querySelector('.controls .before');
            prevBtn.click();
            break;

        case 'KeyD': // D键切换下一首
            const nextBtn = document.querySelector('.controls .after');
            nextBtn.click();
            break;

        case 'KeyC': // C键切换播放模式
            const modeBtn = document.querySelector('.controls .mode');
            modeBtn.click();
            break;
    }
});

