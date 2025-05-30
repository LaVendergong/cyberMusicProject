<template>
    <canvas ref="canvasRef" id="spectrum"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
    audioElement: {
        type: [Object, null],
        required: false,
        default: null
    }
});

// 添加调试日志
console.log('PlayerVisualizer props:', {
    audioElement: props.audioElement,
    type: props.audioElement ? typeof props.audioElement : 'null'
});

const canvasRef = ref(null);
let audioCtx = null;
let analyser = null;
let source = null;
let animationFrame = null;
let isInitialized = ref(false);

// 获取主题颜色
const getThemeColor = () => {
    const style = getComputedStyle(document.documentElement);
    return {
        primary: style.getPropertyValue('--primary-color').trim() || '#00F0FF',
        secondary: style.getPropertyValue('--secondary-color').trim() || '#FF00FF',
        accent: style.getPropertyValue('--accent-color').trim() || '#9D00FF',
        background: style.getPropertyValue('--background-color').trim() || '#0A0A12',
        surface: style.getPropertyValue('--surface-color').trim() || '#1a1a2e',
        text: style.getPropertyValue('--text-color').trim() || '#FFFFFF'
    };
};

// 粒子系统
const particles = [];
const PARTICLE_COUNT = 50;  // 粒子数量
const PARTICLE_RADIUS = 3;  // 粒子半径
const PARTICLE_SPEED = 0.8;   // 降低粒子速度

// 初始化粒子
const initParticles = () => {
    const themeColor = getThemeColor();
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * canvasRef.value.width,
            y: Math.random() * canvasRef.value.height,
            vx: (Math.random() - 0.5) * PARTICLE_SPEED * 0.5, // 降低初始速度
            vy: (Math.random() - 0.5) * PARTICLE_SPEED * 0.5, // 降低初始速度
            radius: PARTICLE_RADIUS,
            color: `${themeColor.secondary}${Math.floor(Math.random() * 50 + 30).toString(16).padStart(2, '0')}`
        });
    }
};

// 检查粒子与频谱柱的碰撞
const checkBarCollision = (particle, barX, barY, barWidth, barHeight) => {
    // 计算粒子到柱体四个边的距离
    const dx = Math.max(barX - particle.x, 0, particle.x - (barX + barWidth));
    const dy = Math.max(barY - particle.y, 0, particle.y - (barY + barHeight));
    
    // 如果粒子与柱体相交
    if (dx === 0 && dy === 0) {
        // 确定碰撞方向
        const centerX = barX + barWidth / 2;
        const centerY = barY + barHeight / 2;
        const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
        
        // 根据碰撞方向反弹，降低反弹力度
        const bounceForce = PARTICLE_SPEED * 0.8;
        particle.vx = Math.cos(angle) * bounceForce;
        particle.vy = Math.sin(angle) * bounceForce;
        
        // 确保粒子被推出柱体
        const pushDistance = Math.max(barWidth, barHeight) / 2;
        particle.x += Math.cos(angle) * pushDistance;
        particle.y += Math.sin(angle) * pushDistance;
        
        // 添加随机偏移，防止粒子卡在边界
        particle.vx += (Math.random() - 0.5) * 0.2; // 降低随机偏移
        particle.vy += (Math.random() - 0.5) * 0.2; // 降低随机偏移
        
        return true;
    }
    return false;
};

// 更新粒子位置
const updateParticles = (dataArray, barWidth, barGap) => {
    const width = canvasRef.value.width;
    const height = canvasRef.value.height;
    
    particles.forEach(particle => {
        // 保存原始位置
        const originalX = particle.x;
        const originalY = particle.y;
        
        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // 边界碰撞检测
        if (particle.x < particle.radius) {
            particle.x = particle.radius;
            particle.vx = Math.abs(particle.vx) * 0.6; // 增加阻尼
        } else if (particle.x > width - particle.radius) {
            particle.x = width - particle.radius;
            particle.vx = -Math.abs(particle.vx) * 0.6;
        }
        
        if (particle.y < particle.radius) {
            particle.y = particle.radius;
            particle.vy = Math.abs(particle.vy) * 0.6;
        } else if (particle.y > height - particle.radius) {
            particle.y = height - particle.radius;
            particle.vy = -Math.abs(particle.vy) * 0.6;
        }
        
        // 检查与频谱柱的碰撞
        let x = 0;
        let hasCollision = false;
        
        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = (dataArray[i] / 255) * height;
            const barY = height - barHeight;
            
            if (checkBarCollision(particle, x, barY, barWidth - barGap, barHeight)) {
                hasCollision = true;
                // 碰撞后改变粒子颜色
                particle.color = `${getThemeColor().secondary}${Math.floor(Math.random() * 50 + 30).toString(16).padStart(2, '0')}`;
                break;
            }
            
            x += barWidth;
        }
        
        // 如果发生碰撞，确保粒子不会卡住
        if (hasCollision) {
            // 如果粒子移动距离太小，给予一个随机推力
            const moveDistance = Math.sqrt(
                Math.pow(particle.x - originalX, 2) + 
                Math.pow(particle.y - originalY, 2)
            );
            
            if (moveDistance < 1) {
                const randomAngle = Math.random() * Math.PI * 2;
                particle.vx = Math.cos(randomAngle) * PARTICLE_SPEED; // 降低推力
                particle.vy = Math.sin(randomAngle) * PARTICLE_SPEED; // 降低推力
            }
        }
    });
    
    // 粒子之间的碰撞检测
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[j].x - particles[i].x;
            const dy = particles[j].y - particles[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < particles[i].radius + particles[j].radius) {
                // 碰撞响应
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);
                
                // 旋转速度
                const vx1 = particles[i].vx * cos + particles[i].vy * sin;
                const vy1 = particles[i].vy * cos - particles[i].vx * sin;
                const vx2 = particles[j].vx * cos + particles[j].vy * sin;
                const vy2 = particles[j].vy * cos - particles[j].vx * sin;
                
                // 交换速度并添加随机偏移
                particles[i].vx = vx2 * cos - vy1 * sin + (Math.random() - 0.5) * 0.2; // 降低随机偏移
                particles[i].vy = vy1 * cos + vx2 * sin + (Math.random() - 0.5) * 0.2;
                particles[j].vx = vx1 * cos - vy2 * sin + (Math.random() - 0.5) * 0.2;
                particles[j].vy = vy2 * cos + vx1 * sin + (Math.random() - 0.5) * 0.2;
                
                // 碰撞后改变粒子颜色
                particles[i].color = `${getThemeColor().secondary}${Math.floor(Math.random() * 50 + 30).toString(16).padStart(2, '0')}`;
                particles[j].color = `${getThemeColor().secondary}${Math.floor(Math.random() * 50 + 30).toString(16).padStart(2, '0')}`;
                
                // 确保粒子不会重叠
                const overlap = (particles[i].radius + particles[j].radius - distance) / 2;
                particles[i].x -= cos * overlap;
                particles[i].y -= sin * overlap;
                particles[j].x += cos * overlap;
                particles[j].y += sin * overlap;
            }
        }
    }
};

// 清理音频资源
const cleanupAudioResources = () => {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    
    if (source) {
        try {
            source.disconnect();
        } catch (e) {
            console.error('断开音频源连接失败:', e);
        }
        source = null;
    }
    
    if (analyser) {
        try {
            analyser.disconnect();
        } catch (e) {
            console.error('断开分析器连接失败:', e);
        }
        analyser = null;
    }
    
    if (audioCtx) {
        try {
            audioCtx.close();
        } catch (e) {
            console.error('关闭音频上下文失败:', e);
        }
        audioCtx = null;
    }
    
    isInitialized.value = false;
};

// 初始化音频分析器
const initAudioAnalyser = () => {
    console.log('开始初始化音频分析器，当前状态:', {
        hasAudioElement: !!props.audioElement,
        readyState: props.audioElement?.readyState,
        isInitialized: isInitialized.value,
        hasCanvas: !!canvasRef.value
    });

    try {
        if (!props.audioElement || !canvasRef.value) {
            console.log('音频元素或Canvas不存在，无法初始化分析器');
            return;
        }

        if (isInitialized.value) {
            console.log('音频分析器已经初始化，跳过');
            return;
        }

        createAudioAnalyser();
    } catch (error) {
        console.error('初始化音频分析器失败:', error);
        cleanupAudioResources();
    }
};

// 创建音频分析器
const createAudioAnalyser = () => {
    try {
        console.log('开始创建音频上下文和分析器');
        
        // 如果已经存在音频上下文，先关闭它
        if (audioCtx) {
            console.log('关闭现有音频上下文');
            audioCtx.close();
            audioCtx = null;
        }

        // 创建新的音频上下文
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        
        // 设置分析器参数
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
        
        // 创建音频源
        if (props.audioElement) {
            try {
                // 检查音频元素是否已经连接到其他音频上下文
                if (props.audioElement.mozPreservesPitch !== undefined) {
                    console.log('音频元素已经连接到其他音频上下文，重新创建');
                    source = audioCtx.createMediaElementSource(props.audioElement);
                } else {
                    source = audioCtx.createMediaElementSource(props.audioElement);
                }
                
                // 连接节点
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                
                console.log('音频分析器创建成功:', {
                    audioCtxState: audioCtx.state,
                    analyserFftSize: analyser.fftSize,
                    analyserFrequencyBinCount: analyser.frequencyBinCount,
                    sourceConnected: source.numberOfOutputs > 0,
                    analyserConnected: analyser.numberOfInputs > 0
                });
            } catch (error) {
                console.error('创建音频源失败:', error);
                // 如果创建失败，清理资源
                if (audioCtx) {
                    audioCtx.close();
                    audioCtx = null;
                }
                analyser = null;
                source = null;
            }
        }
    } catch (error) {
        console.error('创建音频分析器失败:', error);
        // 确保清理所有资源
        if (audioCtx) {
            audioCtx.close();
            audioCtx = null;
        }
        analyser = null;
        source = null;
    }
};

// 绘制频谱
const draw = () => {
    if (!canvasRef.value || !analyser) {
        console.log('绘制条件不满足:', {
            hasCanvas: !!canvasRef.value,
            hasAnalyser: !!analyser,
            canvasValue: canvasRef.value,
            analyserValue: analyser,
            isInitialized: isInitialized.value
        });
        return;
    }
    
    const ctx = canvasRef.value.getContext('2d');
    const width = canvasRef.value.width;
    const height = canvasRef.value.height;
    const themeColor = getThemeColor();
    
    // 获取频谱数据
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    // 清除画布
    ctx.clearRect(0, 0, width, height);
    
    // 创建背景渐变
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, `${themeColor.background}cc`); // 80% 不透明度
    bgGradient.addColorStop(0.5, `${themeColor.background}99`); // 60% 不透明度
    bgGradient.addColorStop(1, `${themeColor.background}66`); // 40% 不透明度
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 添加主题色光晕效果
    const glowGradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width
    );
    glowGradient.addColorStop(0, `${themeColor.primary}0d`); // 5% 不透明度
    glowGradient.addColorStop(0.5, `${themeColor.secondary}0a`); // 4% 不透明度
    glowGradient.addColorStop(1, `${themeColor.accent}07`); // 3% 不透明度
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, width, height);

    // 绘制频率振幅曲线
    const curveHeight = height * 0.15; // 增加曲线高度为画布高度的15%
    const curveY = height * 0.2; // 曲线位置在画布20%处
    
    // 创建曲线渐变
    const curveGradient = ctx.createLinearGradient(0, 0, width, 0);
    curveGradient.addColorStop(0, `${themeColor.primary}80`); // 降低透明度到50%
    curveGradient.addColorStop(0.5, `${themeColor.secondary}80`); // 降低透明度到50%
    curveGradient.addColorStop(1, `${themeColor.accent}80`); // 降低透明度到50%
    
    // 绘制主曲线
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = curveGradient;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 计算平均振幅
    let totalAmplitude = 0;
    for (let i = 0; i < dataArray.length; i++) {
        totalAmplitude += dataArray[i];
    }
    const avgAmplitude = totalAmplitude / dataArray.length;
    
    // 绘制曲线
    for (let i = 0; i < dataArray.length; i++) {
        const x = i * (width / dataArray.length);
        // 使用当前频率值与平均值的差异来计算振幅
        const amplitude = ((dataArray[i] - avgAmplitude) / 255) * curveHeight;
        // 使用正弦函数来创建波动，但振幅由频率数据决定
        const y = curveY + amplitude;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            // 使用二次贝塞尔曲线使过渡更平滑
            const prevX = (i - 1) * (width / dataArray.length);
            const prevY = curveY + ((dataArray[i - 1] - avgAmplitude) / 255) * curveHeight;
            const cpX = (prevX + x) / 2;
            ctx.quadraticCurveTo(cpX, prevY, x, y);
        }
    }
    ctx.stroke();
    
    // 绘制曲线阴影
    ctx.save();
    ctx.shadowColor = `${themeColor.primary}20`; // 降低阴影不透明度到12%
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = -2;
    ctx.stroke();
    ctx.restore();
    
    // 绘制曲线光晕
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `${themeColor.secondary}20`; // 降低光晕不透明度到12%
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    
    // 计算频谱柱的尺寸
    const barWidth = (width / dataArray.length) * 2.5;
    const barGap = 2;
    
    // 更新粒子位置（包括与频谱柱的碰撞检测）
    updateParticles(dataArray, barWidth, barGap);
    
    // 绘制粒子
    particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // 绘制粒子轨迹
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x - particle.vx * 5, particle.y - particle.vy * 5);
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 1;
        ctx.stroke();
    });
    
    // 绘制频谱柱状图
    let x = 0;
    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        const barY = height - barHeight;
        
        // 创建柱状图渐变
        const gradient = ctx.createLinearGradient(0, height, 0, barY);
        
        // 根据柱体高度决定是否添加白色渐变
        if (barHeight > height * 0.95) { // 当柱体高度超过画布高度的95%时
            gradient.addColorStop(0, `${themeColor.primary}e6`);  // 底部使用主题色
            gradient.addColorStop(0.5, `${themeColor.secondary}b3`); // 中间使用次要色
            gradient.addColorStop(0.8, `${themeColor.accent}80`); // 上部使用强调色
            gradient.addColorStop(0.95, 'rgba(255, 255, 255, 0.9)'); // 接近顶部开始变白
            gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');  // 顶部纯白
        } else {
            gradient.addColorStop(0, `${themeColor.primary}e6`);  // 底部使用主题色
            gradient.addColorStop(0.5, `${themeColor.secondary}b3`); // 中间使用次要色
            gradient.addColorStop(1, `${themeColor.accent}80`); // 顶部使用强调色
        }
        
        // 绘制主柱状图
        ctx.fillStyle = gradient;
        ctx.fillRect(x, barY, barWidth - barGap, barHeight);
        
        // 添加阴影效果
        ctx.shadowColor = `${themeColor.accent}80`;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = -4;
        
        x += barWidth;
    }
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // 继续动画
    animationFrame = requestAnimationFrame(draw);
    
    // 每100帧输出一次日志
    if (Math.random() < 0.01) {
        console.log('正在绘制频谱:', {
            canvasSize: { width, height },
            dataArrayLength: dataArray.length,
            barWidth,
            firstBarHeight: dataArray[0] / 255 * height,
            lastBarHeight: dataArray[dataArray.length - 1] / 255 * height,
            isInitialized: isInitialized.value,
            hasAudioCtx: !!audioCtx,
            hasSource: !!source,
            hasAnalyser: !!analyser,
            audioCtxState: audioCtx?.state,
            analyserFftSize: analyser?.fftSize,
            analyserFrequencyBinCount: analyser?.frequencyBinCount,
            audioElement: document.querySelector('audio')?.paused ? 'paused' : 'playing',
            particleCount: particles.length
        });
    }
};

// 开始绘制
const startDrawing = () => {
    if (!canvasRef.value || !analyser) {
        console.log('无法开始绘制，缺少必要组件:', {
            hasCanvas: !!canvasRef.value,
            hasAnalyser: !!analyser,
            audioCtxState: audioCtx?.state
        });
        return;
    }

    // 确保音频上下文处于运行状态
    if (audioCtx && audioCtx.state === 'suspended') {
        console.log('恢复音频上下文');
        audioCtx.resume();
    }

    // 设置 Canvas 尺寸
    const container = canvasRef.value.parentElement;
    if (container) {
        canvasRef.value.width = container.clientWidth;
        canvasRef.value.height = container.clientHeight;
        console.log('设置 Canvas 尺寸:', {
            width: canvasRef.value.width,
            height: canvasRef.value.height
        });
    }

    // 初始化粒子系统
    initParticles();
    
    // 开始绘制循环
    draw();
    
    isInitialized.value = true;
    console.log('开始绘制频谱');
};

// 组件挂载时初始化
onMounted(() => {
    console.log('PlayerVisualizer mounted, 当前状态:', {
        hasAudioElement: !!props.audioElement,
        readyState: props.audioElement?.readyState,
        isInitialized: isInitialized.value,
        hasCanvas: !!canvasRef.value
    });

    if (props.audioElement && canvasRef.value) {
        createAudioAnalyser();
        if (analyser) {
            startDrawing();
        }
    }
});

// 监听音频元素变化
watch(() => props.audioElement, (newElement) => {
    console.log('音频元素变化:', {
        hasElement: !!newElement,
        readyState: newElement?.readyState,
        isInitialized: isInitialized.value,
        hasCanvas: !!canvasRef.value
    });

    if (newElement && canvasRef.value) {
        createAudioAnalyser();
        if (analyser) {
            startDrawing();
        }
    }
}, { immediate: true });

// 组件卸载时清理
onUnmounted(() => {
    console.log('PlayerVisualizer unmounted, 清理资源');
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
    }
    analyser = null;
    source = null;
    isInitialized.value = false;
});

// 暴露方法给父组件
defineExpose({
    initAudioAnalyser,
    startDrawing
});
</script>

<style scoped>
#spectrum {
    width: 100%;
    height: 220px;
    
    background: var(--background-color);
    border: 1px solid var(--primary-color);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    display: block;
}
</style>