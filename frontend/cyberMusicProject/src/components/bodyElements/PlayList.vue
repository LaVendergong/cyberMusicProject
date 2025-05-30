<template>
    <div class="songlist recommended">
        <ul>
            <li v-for="song in songs" :key="song._id" 
                :class="{ active: currentSongId === song._id }"
                @click="handleSongClick(song)">
                <div class="song-info">
                    <h3 class="song-title">{{ song.songName }}</h3>
                    <p class="song-artist">{{ song.singer }}</p>
                </div>
                <span class="song-duration">{{ formatDuration(song.duration) }}</span>
                <div class="song-controls">
                    <button class="control-btn" @click.stop="handlePlay(song)">
                        <i class="fas" :class="currentSongId === song._id && isPlaying ? 'fa-pause' : 'fa-play'"></i>
                    </button>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    isPlaying: {
        type: Boolean,
        default: false
    },
    songs: {
        type: Array,
        required: true
    },
    currentSongId: {
        type: String,
        default: ''
    }
});

// 格式化时长
const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 处理歌曲点击
const handleSongClick = (song) => {
    // 如果点击的是当前播放的歌曲，不做任何操作
    if (props.currentSongId === song._id) {
        return;
    }
    
    // 直接触发播放事件
    emit('play-song', song);
};

// 处理播放按钮点击
const handlePlay = (song) => {
    emit('play-song', song);
};

// 定义事件
const emit = defineEmits(['select-song', 'play-song']);
</script>

<style scoped>
.songlist {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    backdrop-filter: blur(10px);
    border: 1px solid var(--primary-color);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
}

.songlist ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.songlist li {
    display: flex;
    align-items: center;
    padding: 1rem;
    margin: 0.5rem 0;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.songlist li:hover {
    background: rgba(0, 255, 255, 0.1);
    transform: translateX(10px);
}

.songlist li.active {
    background: rgba(0, 255, 255, 0.2);
    border-left: 3px solid var(--primary-color);
}

.songlist .song-info {
    flex: 1;
    margin-left: 1rem;
}

.songlist .song-title {
    color: var(--primary-color);
    font-size: 1.1rem;
    margin-bottom: 0.3rem;
}

.songlist .song-artist {
    color: var(--text-color);
    font-size: 0.9rem;
}

.songlist .song-duration {
    color: var(--text-color);
    font-size: 0.9rem;
    margin-left: 1rem;
}

.songlist .song-controls {
    display: flex;
    gap: 1rem;
    margin-left: 1rem;
}

.songlist .control-btn {
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    transition: all 0.3s ease;
}

.songlist .control-btn:hover {
    color: var(--secondary-color);
    transform: scale(1.1);
}

/* 移动端适配 */
@media (max-width: 768px) {
    .songlist {
        padding: 1rem;
    }

    .songlist li {
        padding: 0.8rem;
    }

    .songlist .song-title {
        font-size: 1rem;
    }

    .songlist .song-artist,
    .songlist .song-duration {
        font-size: 0.8rem;
    }

    .songlist .song-controls {
        gap: 0.5rem;
    }
}
</style>

