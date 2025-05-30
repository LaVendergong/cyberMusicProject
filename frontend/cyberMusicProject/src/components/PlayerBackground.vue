<template>
    <div class="player-background">
        <canvas id="particles"></canvas>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';

let canvas, ctx;
let particles = [];
let animationFrameId;

// 获取主题颜色
const getThemeColors = () => {
    const root = document.documentElement;
    return {
        primary: getComputedStyle(root).getPropertyValue('--primary-color').trim(),
        secondary: getComputedStyle(root).getPropertyValue('--secondary-color').trim(),
        accent: getComputedStyle(root).getPropertyValue('--accent-color').trim()
    };
};

const initCanvas = () => {
    canvas = document.getElementById('particles');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

// 粒子类
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.colors = getThemeColors();
        this.color = this.getRandomColor();
        this.targetColor = this.color;
        this.opacity = Math.random() * 0.5 + 0.1;
    }

    getRandomColor() {
        const colors = [this.colors.primary, this.colors.secondary, this.colors.accent];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // 颜色过渡
        if (this.color !== this.targetColor) {
            this.color = this.targetColor;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
    }
}

// 创建粒子
const createParticles = () => {
    particles = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ));
    }
};

// 更新粒子颜色
const updateParticleColors = () => {
    const colors = getThemeColors();
    particles.forEach(particle => {
        particle.colors = colors;
        particle.targetColor = particle.getRandomColor();
    });
};

// 监听主题变化
const handleThemeChange = (event) => {
    const { colors } = event.detail;
    particles.forEach(particle => {
        particle.colors = colors;
        particle.targetColor = particle.getRandomColor();
    });
};

// 动画循环
const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // 连接粒子
    connectParticles();
    
    animationFrameId = requestAnimationFrame(animate);
};

// 连接粒子
const connectParticles = () => {
    const maxDistance = 100;
    const colors = getThemeColors();
    
    for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
                ctx.beginPath();
                ctx.strokeStyle = colors.primary;
                ctx.globalAlpha = 0.2 * (1 - distance / maxDistance);
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
};

const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createParticles();
};

onMounted(() => {
    initCanvas();
    createParticles();
    animate();
    window.addEventListener('resize', handleResize);
    window.addEventListener('themeChange', handleThemeChange);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('themeChange', handleThemeChange);
    cancelAnimationFrame(animationFrameId);
});
</script>

<style scoped>
.player-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background: var(--background-color);
}

#particles {
    width: 100%;
    height: 100%;
}
</style>
