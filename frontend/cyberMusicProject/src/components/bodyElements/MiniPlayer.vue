<template>
    <div class="mini-player" v-show="currentSongInfo._id">
        <audio ref="audioRef" 
               :src="currentSongInfo._id && currentSongInfo.songPath ? `http://127.0.0.1:3000/localmusics/${currentSongInfo.songPath.split('/').pop()}` : ''"
               @timeupdate="audioStore.handleTimeUpdate"
               @ended="audioStore.handleEnded"
               @canplay="handleCanPlay"
               @error="handleError"
               @play="handlePlay"
               @pause="handlePause"
               @loadeddata="handleLoadedData"
               @stalled="handleStalled"
               @waiting="handleWaiting"
               crossorigin="anonymous"
               preload="auto"
               style="display: none;">
        </audio>

        <div class="player-content">
            <div class="song-info" @click="showFullPlayer">
                <div class="cover">
                    <img :src="currentSongInfo.coverUrl" :alt="currentSongInfo.songName">
                    <div class="play-overlay" v-if="!audioStore.isPlaying">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="info">
                    <div class="name">{{ currentSongInfo.songName }}</div>
                    <div class="artist">{{ currentSongInfo.singer }}</div>
                </div>
            </div>

            <div class="controls">
                <button class="control-btn" @click="audioStore.prevTrack">
                    <i class="fas fa-step-backward"></i>
                </button>
                <button class="control-btn play-btn" @click="togglePlay">
                    <i :class="audioStore.isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
                </button>
                <button class="control-btn" @click="audioStore.nextTrack">
                    <i class="fas fa-step-forward"></i>
                </button>
            </div>

            <div class="progress-section">
                <div class="time current">{{ formatTime(audioStore.currentTime) }}</div>
                <div class="progress-bar" @click="handleProgressClick">
                    <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
                </div>
                <div class="time total">{{ formatTime(audioStore.duration) }}</div>
            </div>

            <div class="volume-section">
                <button class="control-btn" @click="audioStore.toggleMute">
                    <i :class="getVolumeIcon"></i>
                </button>
                <div class="volume-slider" @click="handleVolumeClick">
                    <div class="volume-level" :style="{ width: audioStore.volume + '%' }"></div>
                </div>
            </div>

            <div class="extra-controls">
                <button class="control-btn" @click="togglePlayMode">
                    <i :class="getPlayModeIcon"></i>
                </button>
                <button class="control-btn" @click="togglePlaylist">
                    <i class="fas fa-list"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { useAudioStore } from '../../stores/audioStore';

const audioStore = useAudioStore();
const audioRef = ref(null);
const isInitialized = ref(false);
const isAudioReady = ref(false);
const isAudioLoading = ref(false);

// 计算属性
const currentSongInfo = computed(() => audioStore.currentSongInfo);

// 监听音频元素变化
watch(() => audioStore.audioElement, (newElement, oldElement) => {
    console.log('音频元素变化:', {
        hasAudioElement: !!newElement,
        oldElement: !!oldElement,
        isInitialized: isInitialized.value,
        readyState: newElement?.readyState,
        src: newElement?.src
    });

    if (newElement && newElement !== audioRef.value) {
        // 如果旧元素存在，先保存状态
        const wasPlaying = audioStore.isPlaying;
        const currentTime = audioRef.value?.currentTime || 0;
        const currentSrc = audioRef.value?.src;

        // 更新引用
        audioRef.value = newElement;
        
        // 恢复状态
        if (currentSrc) {
            audioRef.value.src = currentSrc;
            audioRef.value.currentTime = currentTime;
            if (wasPlaying) {
                audioRef.value.load();
                audioRef.value.play().catch(error => {
                    console.error('恢复播放失败:', error);
                });
            }
        }
        
        initAudioElement();
    }
}, { immediate: true });

// 初始化音频元素
const initAudioElement = () => {
    if (!audioRef.value) {
        console.error('音频元素不存在');
        return;
    }

    console.log('开始初始化音频元素:', {
        src: audioRef.value.src,
        readyState: audioRef.value.readyState,
        networkState: audioRef.value.networkState,
        volume: audioRef.value.volume,
        muted: audioRef.value.muted
    });
    
    // 设置音频属性
    audioRef.value.preload = 'auto';
    audioRef.value.crossOrigin = 'anonymous';
    
    // 添加事件监听器
    audioRef.value.addEventListener('loadstart', () => {
        console.log('开始加载音频');
        isAudioLoading.value = true;
        isAudioReady.value = false;
    });

    audioRef.value.addEventListener('progress', () => {
        console.log('音频加载进度');
    });

    audioRef.value.addEventListener('canplay', () => {
        console.log('音频可以播放');
        isAudioReady.value = true;
        isInitialized.value = true;
        isAudioLoading.value = false;
        
        // 确保音量设置正确
        audioRef.value.volume = audioStore.volume / 100;
        audioRef.value.muted = audioStore.isMuted;
        
        console.log('音频元素状态:', {
            volume: audioRef.value.volume,
            muted: audioRef.value.muted,
            readyState: audioRef.value.readyState,
            networkState: audioRef.value.networkState,
            src: audioRef.value.src
        });
    });

    audioRef.value.addEventListener('error', (e) => {
        console.error('音频加载错误:', e);
        isAudioReady.value = false;
        isInitialized.value = false;
        isAudioLoading.value = false;
    });

    audioRef.value.addEventListener('ended', () => {
        console.log('音频播放结束');
        audioStore.isPlaying = false;
    });

    // 设置音量和静音状态
    audioRef.value.volume = audioStore.volume / 100;
    audioRef.value.muted = audioStore.isMuted;

    // 初始化 audioStore 中的音频元素
    audioStore.initAudioElement(audioRef.value);

    console.log('音频元素初始化完成');
};

// 监听当前歌曲变化
watch(() => audioStore.currentSongInfo, (newSong) => {
    console.log('当前歌曲变化:', newSong);
    
    if (newSong && newSong._id) {
        const fileName = newSong.songPath.split('/').pop();
        const audioUrl = `http://127.0.0.1:3000/localmusics/${fileName}`;
        console.log('正在加载音频:', audioUrl);
        
        if (audioRef.value) {
            isAudioReady.value = false;
            isAudioLoading.value = true;
            audioRef.value.src = audioUrl;
            audioRef.value.load();
            
            // 确保音量设置正确
            audioRef.value.volume = audioStore.volume / 100;
            audioRef.value.muted = audioStore.isMuted;
        }
    }
}, { deep: true });

// 组件挂载时初始化
onMounted(() => {
    console.log('MiniPlayer mounted, 初始化音频元素');
    const audioEl = document.querySelector('audio');
    if (audioEl) {
        console.log('找到音频元素，开始初始化');
        audioRef.value = audioEl;
        initAudioElement();
    } else {
        console.error('未找到音频元素');
    }
});

// 组件卸载时清理
onUnmounted(() => {
    console.log('MiniPlayer unmounted, 清理音频元素');
    if (audioRef.value) {
        // 只移除事件监听器，不清空源和停止播放
        audioRef.value.removeEventListener('loadstart', () => {});
        audioRef.value.removeEventListener('progress', () => {});
        audioRef.value.removeEventListener('canplay', () => {});
        audioRef.value.removeEventListener('error', () => {});
        audioRef.value.removeEventListener('ended', () => {});
    }
    isInitialized.value = false;
    isAudioReady.value = false;
    isAudioLoading.value = false;
});

const progressPercentage = computed(() => {
    if (!audioStore.duration) return 0;
    return (audioStore.currentTime / audioStore.duration) * 100;
});

const getVolumeIcon = computed(() => {
    if (audioStore.isMuted || audioStore.volume === 0) return 'fas fa-volume-mute';
    if (audioStore.volume < 50) return 'fas fa-volume-down';
    return 'fas fa-volume-up';
});

const getPlayModeIcon = computed(() => {
    switch (audioStore.playMode) {
        case 0: return 'fas fa-repeat';
        case 1: return 'fas fa-random';
        case 2: return 'fas fa-redo';
        default: return 'fas fa-repeat';
    }
});

// 方法
const togglePlay = async () => {
    console.log('切换播放状态，当前状态:', {
        isPlaying: audioStore.isPlaying,
        audioElement: audioRef.value,
        readyState: audioRef.value?.readyState,
        networkState: audioRef.value?.networkState,
        volume: audioRef.value?.volume,
        muted: audioRef.value?.muted
    });

    if (!audioRef.value) {
        console.error('音频元素不存在');
        return;
    }

    try {
        // 确保音量设置正确
        audioRef.value.volume = audioStore.volume / 100;
        audioRef.value.muted = audioStore.isMuted;

        if (audioStore.isPlaying) {
            audioStore.pause();
        } else {
            await audioStore.play();
        }
    } catch (error) {
        console.error('切换播放状态失败:', error);
    }
};

const handleProgressClick = (event) => {
    const progressBar = event.currentTarget;
    const clickPosition = event.offsetX;
    const progressBarWidth = progressBar.offsetWidth;
    const percentage = clickPosition / progressBarWidth;
    const newTime = percentage * audioStore.duration;
    audioStore.seek(newTime);
};

const handleVolumeClick = (event) => {
    const volumeSlider = event.currentTarget;
    const clickPosition = event.offsetX;
    const sliderWidth = volumeSlider.offsetWidth;
    const percentage = (clickPosition / sliderWidth) * 100;
    audioStore.setVolume(Math.round(percentage));
};

const togglePlayMode = () => {
    audioStore.playMode = (audioStore.playMode + 1) % 3;
    audioStore.savePlaylist();
};

const formatTime = (time) => {
    if (!time) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const handleCanPlay = () => {
    console.log('音频已加载完成，准备就绪', {
        readyState: audioRef.value?.readyState,
        networkState: audioRef.value?.networkState,
        src: audioRef.value?.src,
        currentTime: audioRef.value?.currentTime,
        duration: audioRef.value?.duration,
        volume: audioRef.value?.volume,
        muted: audioRef.value?.muted,
        paused: audioRef.value?.paused
    });
    isAudioReady.value = true;
    isAudioLoading.value = false;
};

const handleError = (error) => {
    if (!audioRef.value?.src || audioRef.value.src === 'http://localhost:5173/') return;
    
    console.error('音频加载错误:', error);
    isAudioReady.value = false;
    isAudioLoading.value = false;
    
    // 检查音频元素的状态
    if (audioRef.value) {
        console.error('音频元素状态:', {
            src: audioRef.value.src,
            error: audioRef.value.error,
            networkState: audioRef.value.networkState,
            readyState: audioRef.value.readyState,
            paused: audioRef.value.paused,
            currentTime: audioRef.value.currentTime,
            duration: audioRef.value.duration,
            volume: audioRef.value.volume,
            muted: audioRef.value.muted
        });
    }
    audioStore.isPlaying = false;
};

const handlePlay = () => {
    console.log('音频开始播放');
    audioStore.isPlaying = true;
};

const handlePause = () => {
    console.log('音频暂停播放');
    audioStore.isPlaying = false;
};

const handleLoadedData = () => {
    console.log('音频数据已加载');
    isAudioReady.value = true;
    isAudioLoading.value = false;
};

const handleStalled = () => {
    console.log('音频加载停滞');
    isAudioLoading.value = true;
};

const handleWaiting = () => {
    console.log('音频等待中');
    isAudioLoading.value = true;
};

// 事件处理
const showFullPlayer = () => {
    // 触发自定义事件，通知父组件显示完整播放器
    window.dispatchEvent(new CustomEvent('showFullPlayer'));
};

const togglePlaylist = () => {
    // 触发自定义事件，通知父组件显示播放列表
    window.dispatchEvent(new CustomEvent('togglePlaylist'));
};
</script>

<style scoped>
.mini-player {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface-color);
    padding: 0.75rem 1.5rem;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.player-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.song-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    cursor: pointer;
}

.cover {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 0.5rem;
    overflow: hidden;
}

.cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
}

.info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.name {
    color: var(--text-color);
    font-weight: 500;
}

.artist {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.875rem;
}

.controls {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.control-btn {
    background: none;
    border: none;
    color: var(--text-color);
    opacity: 0.7;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: all 0.3s ease;
}

.control-btn:hover {
    opacity: 1;
    color: var(--primary-color);
}

.play-btn {
    width: 40px;
    height: 40px;
    background: var(--primary-color);
    color: white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.play-btn:hover {
    transform: scale(1.1);
    background: var(--secondary-color);
}

.progress-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 2;
}

.time {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.875rem;
    min-width: 45px;
}

.progress-bar {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    cursor: pointer;
    position: relative;
}

.progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--primary-color);
    border-radius: 2px;
    transition: width 0.1s linear;
}

.volume-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 150px;
}

.volume-slider {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    cursor: pointer;
    position: relative;
}

.volume-level {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--primary-color);
    border-radius: 2px;
}

.extra-controls {
    display: flex;
    gap: 0.5rem;
}

/* 响应式布局 */
@media (max-width: 768px) {
    .mini-player {
        padding: 0.5rem 1rem;
    }

    .player-content {
        gap: 1rem;
    }

    .progress-section {
        display: none;
    }

    .volume-section {
        display: none;
    }

    .extra-controls {
        display: none;
    }
}
</style> 