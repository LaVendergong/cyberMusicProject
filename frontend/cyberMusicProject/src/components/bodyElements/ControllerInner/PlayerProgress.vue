<template>
    <div class="progress-container">
        <div class="progress-bar" @click="onProgressClick">
            <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="time-info">
            <span class="current-time">{{ formatTime(currentTime) }}</span>
            <span class="duration">{{ formatTime(duration) }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    currentTime: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: 0
    }
});

const emit = defineEmits(['seek']);

const progressPercentage = computed(() => {
    return (props.currentTime / props.duration) * 100 || 0;
});

const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const onProgressClick = (event) => {
    const progressBar = event.currentTarget;
    const clickPosition = event.offsetX;
    const progressBarWidth = progressBar.offsetWidth;
    const seekTime = (clickPosition / progressBarWidth) * props.duration;
    emit('seek', seekTime);
};
</script>

<style scoped>
.progress-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
}

.progress-bar {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 0.5rem;
    cursor: pointer;
    position: relative;
}

.progress-bar:hover .progress::after {
    transform: scale(1);
}

.progress {
    height: 100%;
    background: var(--primary-color);
    box-shadow: 0 0 10px var(--primary-color);
    transition: width 0.1s linear;
    position: relative;
}

.progress::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%) scale(0);
    width: 12px;
    height: 12px;
    background: var(--primary-color);
    border-radius: 50%;
    box-shadow: 0 0 10px var(--primary-color);
    transition: transform 0.2s ease;
}

.time-info {
    display: flex;
    justify-content: space-between;
    color: var(--text-color);
    font-size: 0.9rem;
}
</style>