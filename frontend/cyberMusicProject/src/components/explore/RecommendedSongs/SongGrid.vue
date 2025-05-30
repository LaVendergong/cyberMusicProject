<template>
    <div class="song-grid">
        <div v-for="song in songs" 
             :key="song._id" 
             class="song-card"
             @click="handleSongClick(song)">
            <div class="song-cover-wrapper">
                <img :src="song.coverUrl" :alt="song.songName" class="song-cover">
                <div class="song-overlay">
                    <button class="play-btn" @click.stop="playSong(song)">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="action-btn" @click.stop="addToPlaylist(song)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="song-info">
                <div class="song-name">{{ song.songName }}</div>
                <div class="song-artist">{{ song.singer }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    songs: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['play-song', 'add-to-playlist']);

// 处理歌曲点击
const handleSongClick = (song) => {
    emit('play-song', song);
};

// 播放歌曲
const playSong = (song) => {
    emit('play-song', song);
};

// 添加到播放列表
const addToPlaylist = (song) => {
    emit('add-to-playlist', song);
};
</script>

<style scoped>
.song-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
}

.song-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
}

.song-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.song-cover-wrapper {
    position: relative;
    width: 100%;
    padding-top: 100%; /* 1:1 宽高比 */
}

.song-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.song-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.song-card:hover .song-overlay {
    opacity: 1;
}

.play-btn, .action-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.play-btn:hover, .action-btn:hover {
    background: var(--primary-color);
    transform: scale(1.1);
}

.song-info {
    padding: 1rem;
}

.song-name {
    color: var(--text-color);
    font-weight: 500;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-artist {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 响应式布局 */
@media (max-width: 768px) {
    .song-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 1rem;
    }

    .song-info {
        padding: 0.75rem;
    }

    .play-btn, .action-btn {
        width: 32px;
        height: 32px;
    }
}
</style> 