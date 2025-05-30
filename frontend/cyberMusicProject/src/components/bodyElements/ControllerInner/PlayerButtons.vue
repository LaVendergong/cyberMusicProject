<template>
    <div class="controls">
        <button class="control-btn mode" @click="onModeChange">
            <i :class="modeIcon"></i>
        </button>
        <button class="control-btn before" @click="onPrev">
            <i class="fas fa-step-backward"></i>
        </button>
        <button class="control-btn play-btn" @click="onPlayPause">
            <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
        </button>
        <button class="control-btn after" @click="onNext">
            <i class="fas fa-step-forward"></i>
        </button>
        <button class="control-btn share-btn" @click="onShare">
            <i class="fas fa-share-alt"></i>
        </button>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    isPlaying: {
        type: Boolean,
        default: false
    },
    currentIndex: {
        type: Number,
        default: 0
    },
    playlist: {
        type: Array,
        default: () => []
    },
    playMode: {
        type: Number,
        default: 0 // 0: 顺序播放, 1: 随机播放, 2: 单曲循环
    }
});

const emit = defineEmits(['play', 'pause', 'next', 'prev', 'modeChange', 'share']);

// 计算播放模式图标
const modeIcon = computed(() => {
    switch (props.playMode) {
        case 0:
            return 'fa-solid fa-right-long';
        case 1:
            return 'fas fa-random';
        case 2:
            return 'fas fa-redo';
        default:
            return 'fa-solid fa-right-long';
    }
});

const onPlayPause = () => {
    if (props.isPlaying) {
        emit('pause');
    } else {
        emit('play');
    }
};

const onNext = () => {
    if (props.playlist.length === 0) return;
    emit('next');
};

const onPrev = () => {
    if (props.playlist.length === 0) return;
    emit('prev');
};

const onModeChange = () => {
    emit('modeChange');
};

const onShare = () => {
    emit('share');
};
</script>

<style scoped>
.controls {
    width: 100%;
    height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin: 1.5rem 0;
}

.control-btn {
    background: none;
    border: none;
    color: var(--primary-color);
    font-size: 1.8rem;
    cursor: pointer;
    transition: all 0.3s;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    position: relative;
}

.control-btn::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    background: transparent;
    border: 2px solid var(--primary-color);
    opacity: 0.5;
    animation: energy-pulse 3s infinite;
}

.control-btn:hover {
    color: var(--secondary-color);
    text-shadow: 0 0 10px var(--secondary-color);
    background: rgba(var(--secondary-color), 0.1);
    transform: scale(1.1);
}

.control-btn:hover::after {
    border-color: var(--secondary-color);
    animation: energy-pulse 1.5s infinite;
}

.play-btn {
    background: rgba(var(--primary-color), 0.1);
    border: 1px solid var(--primary-color);
    font-size: 2.2rem;
    width: 80px;
    height: 80px;
}

.play-btn::after {
    animation: energy-pulse 2s infinite;
}

.play-btn:hover {
    background: rgba(var(--secondary-color), 0.2);
    border-color: var(--secondary-color);
}

.play-btn:hover::after {
    border-color: var(--accent-color);
    box-shadow: 0 0 20px var(--accent-color);
    animation: energy-pulse 1s infinite;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .controls {
        gap: 1.5rem;
    }

    .control-btn {
        font-size: 1.5rem;
        width: 50px;
        height: 50px;
    }

    .play-btn {
        font-size: 1.8rem;
        width: 65px;
        height: 65px;
    }
}
</style>
