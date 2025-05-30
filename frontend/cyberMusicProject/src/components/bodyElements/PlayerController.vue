<template>
    <div class="player-controller">
        <div class="player-content">
            <div class="player-main">
                <PlayerCover 
                    :currentSong="audioStore.currentSongInfo" 
                    :isPlaying="audioStore.isPlaying"
                    :currentTime="audioStore.currentTime"
                    :duration="audioStore.duration"
                    @seek="audioStore.seek"
                    @play="audioStore.play"
                    @pause="audioStore.pause"
                />
                <PlayerInfo 
                    :currentSong="audioStore.currentSongInfo"
                />
                <PlayerButtons 
                    :isPlaying="audioStore.isPlaying"
                    :currentIndex="audioStore.currentIndex"
                    :playlist="audioStore.playlist"
                    :playMode="audioStore.playMode"
                    @play="audioStore.play"
                    @pause="audioStore.pause"
                    @next="audioStore.nextTrack"
                    @prev="audioStore.prevTrack"
                    @modeChange="handleModeChange"
                    @share="handleShare"
                />
                <PlayerProgress 
                    :currentTime="audioStore.currentTime"
                    :duration="audioStore.duration"
                    @seek="audioStore.seek"
                />
                <PlayerVolume 
                    :volume="audioStore.volume"
                    :isMuted="audioStore.isMuted"
                    @volumeChange="audioStore.setVolume"
                    @mute="audioStore.toggleMute"
                />
                <div class="visualizer-container" v-if="audioStore.audioElement">
                    <PlayerVisualizer 
                        ref="visualizer" 
                        :audioElement="audioStore.audioElement"
                    />
                </div>
            </div>

            <div class="playlist-section">
                <div class="playlist-header">
                    <h3>播放列表</h3>
                    <div class="playlist-actions">
                        <button class="action-btn" @click="audioStore.clearPlaylist">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="action-btn" @click="togglePlaylist">
                            <i class="fas" :class="isPlaylistVisible ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                        </button>
                    </div>
                </div>
                
                <div class="playlist-content" :class="{ 'show': isPlaylistVisible }">
                    <PlayList 
                        :songs="audioStore.playlist"
                        :isPlaying="audioStore.isPlaying"
                        :currentSongId="audioStore.currentSongInfo._id"
                        @select-song="handleSongSelect"
                        @play-song="handleSongPlay"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { useAudioStore } from '../../stores/audioStore';
import PlayerCover from './ControllerInner/PlayerCover.vue';
import PlayerInfo from './ControllerInner/PlayerInfo.vue';
import PlayerProgress from './ControllerInner/PlayerProgress.vue';
import PlayerButtons from './ControllerInner/PlayerButtons.vue';
import PlayerVolume from './ControllerInner/PlayerVolume.vue';
import PlayerVisualizer from './ControllerInner/PlayerVisualizer.vue';
import PlayList from './PlayList.vue';

const audioStore = useAudioStore();
const audioRef = ref(null);
const visualizer = ref(null);
const isPlaylistVisible = ref(true);

// 监听音频元素变化
watch(() => audioStore.audioElement, (newElement) => {
    console.log('PlayerController: 音频元素变化', {
        hasElement: !!newElement,
        readyState: newElement?.readyState,
        type: typeof newElement
    });
    
    if (newElement) {
        audioRef.value = newElement;
    }
}, { immediate: true });

// 处理播放模式切换
const handleModeChange = () => {
    audioStore.playMode = (audioStore.playMode + 1) % 3;
    audioStore.savePlaylist();
};

// 处理分享
const handleShare = () => {
    const event = new CustomEvent('sharePanel', {
        detail: {
            isVisible: true,
            currentSong: audioStore.currentSongInfo
        }
    });
    window.dispatchEvent(event);
};

// 处理歌曲选择
const handleSongSelect = (song) => {
    const index = audioStore.playlist.findIndex(s => s._id === song._id);
    if (index !== -1) {
        audioStore.changeTrack(index);
    }
};

// 处理歌曲播放
const handleSongPlay = async (song) => {
    try {
        // 如果正在播放同一首歌，则暂停
        if (audioStore.currentSongInfo._id === song._id && audioStore.isPlaying) {
            audioStore.pause();
            return;
        }
        
        // 如果正在播放其他歌曲，先停止
        if (audioStore.isPlaying) {
            audioStore.pause();
        }
        
        // 更新当前歌曲信息
        const index = audioStore.playlist.findIndex(s => s._id === song._id);
        if (index !== -1) {
            await audioStore.changeTrack(index);
            await audioStore.play();
        }
    } catch (error) {
        console.error('播放失败:', error);
        audioStore.isPlaying = false;
    }
};

// 切换播放列表显示
const togglePlaylist = () => {
    isPlaylistVisible.value = !isPlaylistVisible.value;
};

// 组件挂载时初始化
onMounted(() => {
    console.log('PlayerController mounted, 音频元素状态:', {
        hasAudioElement: !!audioStore.audioElement,
        type: typeof audioStore.audioElement
    });
});

// 组件卸载时清理
onUnmounted(() => {
    console.log('PlayerController unmounted');
});

// 暴露方法给父组件
defineExpose({
    audioRef
});
</script>

<style scoped>
.player-controller {
    width: 100%;
    padding: 2rem;
    background: var(--surface-color);
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.player-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.player-main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.visualizer-container {
    width: 100%;
    height: 220px;
    margin-top: 2rem;
    background: var(--surface-color);
    border: 1px solid var(--primary-color);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.playlist-section {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 0.5rem;
    overflow: hidden;
    margin-top: 1rem;
}

.playlist-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.1);
}

.playlist-header h3 {
    margin: 0;
    color: var(--primary-color);
}

.playlist-actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: all 0.3s ease;
}

.action-btn:hover {
    background: rgba(var(--primary-color), 0.1);
    color: var(--secondary-color);
}

.playlist-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.playlist-content.show {
    max-height: 300px;
}

.empty-playlist {
    padding: 2rem;
    text-align: center;
    color: var(--text-color);
    opacity: 0.7;
}

.empty-playlist i {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.playlist-items {
    display: flex;
    flex-direction: column;
}

.playlist-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border-bottom: 1px solid rgba(var(--primary-color), 0.1);
}

.playlist-item:hover {
    background: rgba(var(--primary-color), 0.1);
}

.playlist-item.active {
    background: rgba(var(--primary-color), 0.2);
}

.track-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.track-number {
    color: var(--text-color);
    opacity: 0.7;
    width: 2rem;
    text-align: center;
}

.track-cover {
    width: 40px;
    height: 40px;
    border-radius: 0.25rem;
    object-fit: cover;
}

.track-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.track-name {
    color: var(--text-color);
    font-weight: 500;
}

.track-artist {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.875rem;
}

.track-actions {
    opacity: 0;
    transition: opacity 0.3s ease;
}

.playlist-item:hover .track-actions {
    opacity: 1;
}

.track-btn {
    background: none;
    border: none;
    color: var(--text-color);
    opacity: 0.7;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: all 0.3s ease;
}

.track-btn:hover {
    opacity: 1;
    color: var(--accent-color);
}

/* 自定义滚动条样式 */
.playlist-content::-webkit-scrollbar {
    width: 6px;
}

.playlist-content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
}

.playlist-content::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 3px;
}

.playlist-content::-webkit-scrollbar-thumb:hover {
    background: var(--secondary-color);
}

/* 添加遮罩层样式 */
.share-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.share-overlay.show {
    opacity: 1;
    visibility: visible;
}
</style>

