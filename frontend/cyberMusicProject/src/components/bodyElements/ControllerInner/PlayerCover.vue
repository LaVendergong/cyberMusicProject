<template>
    <div class="cover-container">
        <div class="album-art" 
             :class="{ 'is-playing': isPlaying }" 
             @mousedown="startDrag"
             @touchstart="startDrag"
             @click="handleClick">
            <img :src="coverUrl" 
                 :alt="songName" 
                 draggable="false">
        </div>
        <div class="seek-indicator" v-if="isDragging">
            <span class="seek-time">{{ formatTime(seekTime) }}</span>
            <span class="seek-direction">{{ seekDirection }}</span>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
    isPlaying: {
        type: Boolean,
        default: false
    },
    currentTime: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: 0
    },
    currentSong: {
        type: Object,
        required: true,
        default: () => ({
            songName: '未知歌曲',
            coverUrl: 'https://ts1.tc.mm.bing.net/th/id/R-C.cd4d1907b4bf2fdef5b8ac246b20c6fa?rik=W8PYNxfYr82YQA&riu=http%3a%2f%2fi.gtimg.cn%2fqqlive%2fimg%2fjpgcache%2ffiles%2fqqvideo%2f9%2f9wcrz7hl4qasz4m.jpg&ehk=EE1F1DIjerWCgoAht40kgy19qgYTPZf82L4xEvJoLfk%3d&risl=&pid=ImgRaw&r=0'
        })
    }
});

const emit = defineEmits(['play', 'pause', 'seek']);

const isDragging = ref(false);
const isMouseDown = ref(false);
const startX = ref(0);
const startY = ref(0);
const seekTime = ref(0);
const seekDirection = ref('');
const dragThreshold = 5; // 拖拽阈值，超过这个值才认为是拖拽

const startDrag = (event) => {
    isMouseDown.value = true;
    startX.value = event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
    startY.value = event.type.includes('touch') ? event.touches[0].clientY : event.clientY;
    seekTime.value = props.currentTime;
};

const onDrag = (event) => {
    if (!isMouseDown.value) return;
    
    const currentX = event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
    const currentY = event.type.includes('touch') ? event.touches[0].clientY : event.clientY;
    
    // 计算水平和垂直方向的移动距离
    const deltaX = currentX - startX.value;
    const deltaY = currentY - startY.value;
    
    // 如果还没有开始拖拽，检查是否超过阈值
    if (!isDragging.value) {
        // 如果水平移动距离大于阈值，且水平移动大于垂直移动，则开始拖拽
        if (Math.abs(deltaX) > dragThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
            isDragging.value = true;
        }
        return;
    }
    
    // 只更新预览时间和方向，不触发快进快退
    const timeChange = deltaX * 0.5;
    seekTime.value = Math.max(0, Math.min(props.duration, props.currentTime + timeChange));
    seekDirection.value = deltaX > 0 ? '→' : '←';
};

const endDrag = (event) => {
    if (isMouseDown.value) {
        const currentX = event.type.includes('touch') ? event.changedTouches[0].clientX : event.clientX;
        const deltaX = currentX - startX.value;
        const deltaY = event.type.includes('touch') ? event.changedTouches[0].clientY - startY.value : event.clientY - startY.value;
        
        // 在松手时判断是否满足拖拽条件
        if (Math.abs(deltaX) > dragThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
            // 计算最终的时间变化
            const timeChange = deltaX * 0.5;
            const finalTime = Math.max(0, Math.min(props.duration, props.currentTime + timeChange));
            
            // 执行快进快退
            emit('seek', finalTime);
        }
    }
    
    // 重置所有状态
    isDragging.value = false;
    isMouseDown.value = false;
    seekDirection.value = '';
};

// 处理封面点击
const handleClick = (event) => {
    // 如果没有拖拽，则触发播放/暂停
    if (!isDragging.value) {
        if (props.isPlaying) {
            emit('pause');
        } else {
            emit('play');
        }
    }
};

const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// 计算属性
const coverUrl = computed(() => {
    console.log('封面URL更新:', props.currentSong);
    if (!props.currentSong || !props.currentSong.imgPath) {
        return 'https://ts1.tc.mm.bing.net/th/id/R-C.cd4d1907b4bf2fdef5b8ac246b20c6fa?rik=W8PYNxfYr82YQA&riu=http%3a%2f%2fi.gtimg.cn%2fqqlive%2fimg%2fjpgcache%2ffiles%2fqqvideo%2f9%2f9wcrz7hl4qasz4m.jpg&ehk=EE1F1DIjerWCgoAht40kgy19qgYTPZf82L4xEvJoLfk%3d&risl=&pid=ImgRaw&r=0';
    }
    return `http://127.0.0.1:3000${props.currentSong.imgPath}`;
});

const songName = computed(() => {
    console.log('歌曲名称更新:', props.currentSong);
    if (!props.currentSong || !props.currentSong.songName) {
        return '未知歌曲';
    }
    return props.currentSong.songName;
});

// 监听歌曲变化
watch(() => props.currentSong, (newSong) => {
    console.log('歌曲信息变化:', newSong);
}, { deep: true });

// 添加全局事件监听
onMounted(() => {
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', endDrag);
});

// 移除全局事件监听
onUnmounted(() => {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', endDrag);
});
</script>

<style scoped>
.cover-container {
    position: relative;
    width: 300px;
    height: 300px;
    margin: 0 auto;
}

.album-art {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 0 20px var(--primary-color);
    cursor: pointer;
    transition: transform 0.3s ease;
    animation: rotate 20s linear infinite;
    animation-play-state: paused;
    user-select: none;
    -webkit-user-drag: none;
}

.album-art:hover {
    transform: scale(1.05);
}

.album-art.is-playing {
    animation-play-state: running;
}

.album-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
}

.seek-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    padding: 1rem;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    z-index: 10;
}

.seek-time {
    font-size: 1.2rem;
    color: var(--primary-color);
    text-shadow: 0 0 5px var(--primary-color);
}

.seek-direction {
    font-size: 1.5rem;
    color: var(--primary-color);
    text-shadow: 0 0 5px var(--primary-color);
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* 移动端适配 */
@media (max-width: 768px) {
    .cover-container {
        width: 200px;
        height: 200px;
    }
    
    .seek-indicator {
        padding: 0.5rem;
    }
    
    .seek-time {
        font-size: 1rem;
    }
    
    .seek-direction {
        font-size: 1.2rem;
    }
}
</style>

