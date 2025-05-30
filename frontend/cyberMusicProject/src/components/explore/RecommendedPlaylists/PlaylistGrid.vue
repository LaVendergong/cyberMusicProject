<template>
    <div class="playlist-grid">
        <div v-for="playlist in playlists" 
             :key="playlist._id" 
             class="playlist-card"
             @click="handlePlaylistClick(playlist)">
            <div class="playlist-cover-wrapper">
                <img :src="playlist.coverUrl" :alt="playlist.name" class="playlist-cover">
                <div class="playlist-overlay">
                    <button class="play-btn" @click.stop="playPlaylist(playlist)">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="action-btn" @click.stop="addToFavorites(playlist)">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="playlist-count">
                    <i class="fas fa-music"></i>
                    {{ playlist.songCount }} 首歌曲
                </div>
            </div>
            <div class="playlist-info">
                <div class="playlist-name">{{ playlist.name }}</div>
                <div class="playlist-creator">
                    <i class="fas fa-user"></i>
                    {{ playlist.creator }}
                </div>
                <div class="playlist-description">{{ playlist.description }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    playlists: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['select-playlist', 'play-playlist', 'add-to-favorites']);

// 处理歌单点击
const handlePlaylistClick = (playlist) => {
    emit('select-playlist', playlist);
};

// 播放歌单
const playPlaylist = (playlist) => {
    emit('play-playlist', playlist);
};

// 添加到收藏
const addToFavorites = (playlist) => {
    emit('add-to-favorites', playlist);
};
</script>

<style scoped>
.playlist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 2rem;
}

.playlist-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
}

.playlist-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.playlist-cover-wrapper {
    position: relative;
    width: 100%;
    padding-top: 100%; /* 1:1 宽高比 */
}

.playlist-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.playlist-overlay {
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

.playlist-card:hover .playlist-overlay {
    opacity: 1;
}

.play-btn, .action-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 48px;
    height: 48px;
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

.playlist-count {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.5rem;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    color: white;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.playlist-info {
    padding: 1.25rem;
}

.playlist-name {
    color: var(--text-color);
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.playlist-creator {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.playlist-description {
    color: var(--text-color);
    opacity: 0.6;
    font-size: 0.875rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
}

/* 响应式布局 */
@media (max-width: 768px) {
    .playlist-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 1rem;
    }

    .playlist-info {
        padding: 1rem;
    }

    .play-btn, .action-btn {
        width: 40px;
        height: 40px;
    }

    .playlist-name {
        font-size: 1rem;
    }

    .playlist-description {
        -webkit-line-clamp: 1;
    }
}
</style> 