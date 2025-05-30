<template>
    <div class="trending-section">
        <div class="section-header">
            <h2 class="section-title">热门榜单</h2>
            <div class="trending-tabs">
                <button 
                    v-for="tab in tabs" 
                    :key="tab.id"
                    :class="['tab-btn', { active: activeTab === tab.id }]"
                    @click="activeTab = tab.id">
                    {{ tab.name }}
                </button>
            </div>
        </div>

        <div class="trending-list">
            <div v-for="(song, index) in filteredSongs" 
                 :key="song._id" 
                 class="trending-item"
                 @click="handleSongClick(song)">
                <div class="rank-number" :class="{ 'top-three': index < 3 }">
                    {{ index + 1 }}
                </div>
                <div class="song-cover">
                    <img :src="song.coverUrl" :alt="song.songName">
                    <div class="play-overlay">
                        <button class="play-btn" @click.stop="playSong(song)">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                <div class="song-info">
                    <div class="song-name">{{ song.songName }}</div>
                    <div class="song-artist">{{ song.singer }}</div>
                </div>
                <div class="song-stats">
                    <div class="play-count">
                        <i class="fas fa-play"></i>
                        {{ formatNumber(song.playCount) }}
                    </div>
                    <div class="trend-indicator" :class="getTrendClass(song.trend)">
                        <i :class="getTrendIcon(song.trend)"></i>
                        {{ song.trend }}%
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    songs: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['play-song', 'select-song']);

const tabs = [
    { id: 'all', name: '全部' },
    { id: 'daily', name: '日榜' },
    { id: 'weekly', name: '周榜' },
    { id: 'monthly', name: '月榜' }
];

const activeTab = ref('all');

// 根据当前选中的标签过滤歌曲
const filteredSongs = computed(() => {
    if (activeTab.value === 'all') {
        return props.songs;
    }
    return props.songs.filter(song => song.period === activeTab.value);
});

// 格式化数字
const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

// 获取趋势样式类
const getTrendClass = (trend) => {
    if (trend > 0) return 'trend-up';
    if (trend < 0) return 'trend-down';
    return 'trend-stable';
};

// 获取趋势图标
const getTrendIcon = (trend) => {
    if (trend > 0) return 'fas fa-arrow-up';
    if (trend < 0) return 'fas fa-arrow-down';
    return 'fas fa-minus';
};

// 处理歌曲点击
const handleSongClick = (song) => {
    emit('select-song', song);
};

// 播放歌曲
const playSong = (song) => {
    emit('play-song', song);
};
</script>

<style scoped>
.trending-section {
    padding: 2rem 0;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.section-title {
    color: var(--text-color);
    font-size: 1.5rem;
    font-weight: 600;
}

.trending-tabs {
    display: flex;
    gap: 1rem;
}

.tab-btn {
    background: none;
    border: none;
    color: var(--text-color);
    opacity: 0.7;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.tab-btn:hover {
    opacity: 1;
}

.tab-btn.active {
    background: var(--primary-color);
    opacity: 1;
}

.trending-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.trending-item {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.trending-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
}

.rank-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
    opacity: 0.5;
    width: 2rem;
    text-align: center;
}

.rank-number.top-three {
    opacity: 1;
    color: var(--primary-color);
}

.song-cover {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 0.5rem;
    overflow: hidden;
}

.song-cover img {
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
    opacity: 0;
    transition: opacity 0.3s ease;
}

.trending-item:hover .play-overlay {
    opacity: 1;
}

.play-btn {
    background: var(--primary-color);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.play-btn:hover {
    transform: scale(1.1);
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

.song-stats {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.play-count {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.trend-indicator {
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.trend-up {
    color: #4caf50;
}

.trend-down {
    color: #f44336;
}

.trend-stable {
    color: var(--text-color);
    opacity: 0.7;
}

/* 响应式布局 */
@media (max-width: 768px) {
    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .trending-tabs {
        width: 100%;
        overflow-x: auto;
        padding-bottom: 0.5rem;
    }

    .trending-item {
        padding: 0.75rem;
        gap: 1rem;
    }

    .song-cover {
        width: 48px;
        height: 48px;
    }

    .song-stats {
        display: none;
    }
}
</style> 