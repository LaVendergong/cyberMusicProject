<template>
    <div class="search-results">
        <div class="results-header">
            <h3>搜索结果</h3>
            <div class="results-count">{{ results.length }} 个结果</div>
        </div>

        <div class="results-content">
            <!-- 歌曲结果 -->
            <div v-if="songResults.length" class="result-section">
                <h4>歌曲</h4>
                <div class="song-list">
                    <div v-for="song in songResults" 
                         :key="song._id" 
                         class="song-item"
                         @click="handleSongClick(song)">
                        <img :src="song.coverUrl" :alt="song.songName" class="song-cover">
                        <div class="song-info">
                            <div class="song-name">{{ song.songName }}</div>
                            <div class="song-artist">{{ song.singer }}</div>
                        </div>
                        <div class="song-actions">
                            <button class="action-btn" @click.stop="playSong(song)">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="action-btn" @click.stop="addToPlaylist(song)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 歌单结果 -->
            <div v-if="playlistResults.length" class="result-section">
                <h4>歌单</h4>
                <div class="playlist-grid">
                    <div v-for="playlist in playlistResults" 
                         :key="playlist._id" 
                         class="playlist-card"
                         @click="handlePlaylistClick(playlist)">
                        <img :src="playlist.coverUrl" :alt="playlist.name" class="playlist-cover">
                        <div class="playlist-info">
                            <div class="playlist-name">{{ playlist.name }}</div>
                            <div class="playlist-count">{{ playlist.songCount }} 首歌曲</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 无结果提示 -->
            <div v-if="!results.length" class="no-results">
                <i class="fas fa-search"></i>
                <p>没有找到相关结果</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    results: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['play-song', 'add-to-playlist', 'select-playlist']);

// 分类搜索结果
const songResults = computed(() => {
    return props.results.filter(item => item.type === 'song');
});

const playlistResults = computed(() => {
    return props.results.filter(item => item.type === 'playlist');
});

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

// 处理歌单点击
const handlePlaylistClick = (playlist) => {
    emit('select-playlist', playlist);
};
</script>

<style scoped>
.search-results {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-top: 1rem;
}

.results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.results-header h3 {
    color: var(--primary-color);
    margin: 0;
    font-size: 1.25rem;
}

.results-count {
    color: var(--text-color);
    opacity: 0.7;
}

.result-section {
    margin-bottom: 2rem;
}

.result-section h4 {
    color: var(--text-color);
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

/* 歌曲列表样式 */
.song-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.song-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.song-item:hover {
    background: rgba(255, 255, 255, 0.1);
}

.song-cover {
    width: 48px;
    height: 48px;
    border-radius: 0.25rem;
    margin-right: 1rem;
}

.song-info {
    flex: 1;
}

.song-name {
    color: var(--text-color);
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.song-artist {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.875rem;
}

.song-actions {
    display: flex;
    gap: 0.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.song-item:hover .song-actions {
    opacity: 1;
}

.action-btn {
    background: none;
    border: none;
    color: var(--text-color);
    opacity: 0.7;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: all 0.3s ease;
}

.action-btn:hover {
    opacity: 1;
    color: var(--primary-color);
    background: rgba(255, 255, 255, 0.1);
}

/* 歌单网格样式 */
.playlist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
}

.playlist-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.5rem;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
}

.playlist-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.playlist-cover {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
}

.playlist-info {
    padding: 1rem;
}

.playlist-name {
    color: var(--text-color);
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.playlist-count {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.875rem;
}

/* 无结果提示 */
.no-results {
    text-align: center;
    padding: 3rem;
    color: var(--text-color);
    opacity: 0.7;
}

.no-results i {
    font-size: 2rem;
    margin-bottom: 1rem;
}

/* 响应式布局 */
@media (max-width: 768px) {
    .playlist-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
}
</style> 