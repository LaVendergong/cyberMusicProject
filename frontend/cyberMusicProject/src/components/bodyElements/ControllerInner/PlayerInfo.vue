<template>
    <div class="player-info">
        <div class="song-info">
            <h3 class="song-name" :title="songName">{{ songName }}</h3>
            <p class="artist-name" :title="artistName">{{ artistName }}</p>
            <p class="album-name" :title="album">{{ album }}</p>
            <div class="meta-info">
                <span class="genre">{{ genre }}</span>
                <span class="release-date">{{ formatDate(releaseDate) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
    currentSong: {
        type: Object,
        required: true,
        default: () => ({
            songName: '未知歌曲',
            singer: '未知歌手',
            album: '未知专辑',
            genre: '未知流派',
            releaseDate: ''
        })
    }
});

// 计算属性
const songName = computed(() => props.currentSong.songName || '未知歌曲');
const artistName = computed(() => props.currentSong.singer || '未知歌手');
const album = computed(() => props.currentSong.album || '未知专辑');
const genre = computed(() => props.currentSong.genre || '未知流派');
const releaseDate = computed(() => props.currentSong.releaseDate || '');

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
</script>

<style scoped>
.player-info {
    padding: 1rem;
    color: var(--text-color);
    text-shadow: 0 0 10px var(--primary-color);
}

.song-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.song-name {
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--primary-color);
}

.artist-name {
    font-size: 1rem;
    margin: 0;
    opacity: 0.8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--secondary-color);
}

.album-name {
    font-size: 0.9rem;
    margin: 0;
    opacity: 0.7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-color);
}

.meta-info {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    opacity: 0.6;
}

.genre {
    background: var(--primary-color);
    color: var(--background-color);
    padding: 0.2rem 0.5rem;
    border-radius: 1rem;
    opacity: 0.8;
}

.release-date {
    font-style: italic;
    color: var(--accent-color);
}

/* 移动端适配 */
@media (max-width: 768px) {
    .song-name {
        font-size: 1rem;
    }
    
    .artist-name {
        font-size: 0.9rem;
    }
}
</style>

