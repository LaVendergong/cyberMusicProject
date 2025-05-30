<template>
    <div class="search-bar">
        <div class="search-input-wrapper">
            <i class="fas fa-search"></i>
            <input 
                type="text" 
                v-model="searchQuery"
                @input="handleInput"
                placeholder="搜索歌曲、歌手、专辑..."
                class="search-input"
            />
            <button 
                v-if="searchQuery" 
                @click="clearSearch" 
                class="clear-btn"
            >
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="search-filters">
            <button 
                v-for="filter in filters" 
                :key="filter.value"
                :class="['filter-btn', { active: activeFilter === filter.value }]"
                @click="setFilter(filter.value)"
            >
                {{ filter.label }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const emit = defineEmits(['search']);

const searchQuery = ref('');
const activeFilter = ref('all');
const filters = [
    { label: '全部', value: 'all' },
    { label: '歌曲', value: 'songs' },
    { label: '歌手', value: 'artists' },
    { label: '专辑', value: 'albums' },
    { label: '歌单', value: 'playlists' }
];

// 处理输入
const handleInput = () => {
    if (searchQuery.value.length >= 2) {
        emit('search', {
            query: searchQuery.value,
            filter: activeFilter.value
        });
    }
};

// 清除搜索
const clearSearch = () => {
    searchQuery.value = '';
    emit('search', { query: '', filter: activeFilter.value });
};

// 设置过滤器
const setFilter = (filter) => {
    activeFilter.value = filter;
    if (searchQuery.value.length >= 2) {
        emit('search', {
            query: searchQuery.value,
            filter: activeFilter.value
        });
    }
};

// 监听过滤器变化
watch(activeFilter, (newFilter) => {
    if (searchQuery.value.length >= 2) {
        emit('search', {
            query: searchQuery.value,
            filter: newFilter
        });
    }
});
</script>

<style scoped>
.search-bar {
    width: 100%;
    max-width: 800px;
    margin: 0 auto 2rem;
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2rem;
    padding: 0.5rem 1rem;
    transition: all 0.3s ease;
}

.search-input-wrapper:focus-within {
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 2px var(--primary-color);
}

.search-input {
    flex: 1;
    background: none;
    border: none;
    color: var(--text-color);
    font-size: 1rem;
    padding: 0.5rem;
    outline: none;
}

.search-input::placeholder {
    color: var(--text-color);
    opacity: 0.5;
}

.fa-search {
    color: var(--primary-color);
    margin-right: 0.5rem;
}

.clear-btn {
    background: none;
    border: none;
    color: var(--text-color);
    opacity: 0.5;
    cursor: pointer;
    padding: 0.5rem;
    transition: all 0.3s ease;
}

.clear-btn:hover {
    opacity: 1;
    color: var(--primary-color);
}

.search-filters {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    justify-content: center;
}

.filter-btn {
    background: none;
    border: none;
    color: var(--text-color);
    opacity: 0.7;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 1rem;
    transition: all 0.3s ease;
}

.filter-btn:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
}

.filter-btn.active {
    opacity: 1;
    background: var(--primary-color);
    color: var(--background-color);
}

@media (max-width: 768px) {
    .search-filters {
        flex-wrap: wrap;
    }
    
    .filter-btn {
        font-size: 0.875rem;
        padding: 0.375rem 0.75rem;
    }
}
</style> 