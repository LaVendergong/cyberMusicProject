<template>
    <div class="explore-page">
        <!-- 搜索部分 -->
        <section class="search-section">
            <SearchBar @search="handleSearch" />
            <SearchResults v-if="searchResults.length" :results="searchResults" />
        </section>

        <!-- 推荐歌曲部分 -->
        <section class="recommended-songs">
            <h2>推荐歌曲</h2>
            <SongGrid :songs="recommendedSongs" />
        </section>

        <!-- 推荐歌单部分 -->
        <section class="recommended-playlists">
            <h2>推荐歌单</h2>
            <PlaylistGrid :playlists="recommendedPlaylists" />
        </section>

        <!-- 音乐分类部分 -->
        <section class="categories">
            <h2>音乐分类</h2>
            <CategoryList :categories="categories" />
        </section>

        <!-- 热门趋势部分 -->
        <section class="trending">
            <h2>热门趋势</h2>
            <TrendingList :items="trendingItems" />
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SearchBar from './SearchSection/SearchBar.vue';
import SearchResults from './SearchSection/SearchResults.vue';
import SongGrid from './RecommendedSongs/SongGrid.vue';
import PlaylistGrid from './RecommendedPlaylists/PlaylistGrid.vue';
import CategoryList from './Categories/CategoryList.vue';
import TrendingList from './Trending/TrendingList.vue';

// 状态管理
const searchResults = ref([]);
const recommendedSongs = ref([]);
const recommendedPlaylists = ref([]);
const categories = ref([]);
const trendingItems = ref([]);

// 处理搜索
const handleSearch = async (query) => {
    try {
        // TODO: 实现搜索逻辑
        console.log('搜索:', query);
    } catch (error) {
        console.error('搜索失败:', error);
    }
};

// 加载数据
onMounted(async () => {
    try {
        // TODO: 实现数据加载逻辑
        // 1. 加载推荐歌曲
        // 2. 加载推荐歌单
        // 3. 加载音乐分类
        // 4. 加载热门趋势
    } catch (error) {
        console.error('加载数据失败:', error);
    }
});
</script>

<style scoped>
.explore-page {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

section {
    margin-bottom: 3rem;
}

h2 {
    color: var(--primary-color);
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    font-family: 'Rajdhani', sans-serif;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* 响应式布局 */
@media (max-width: 768px) {
    .explore-page {
        padding: 1rem;
    }
}
</style> 