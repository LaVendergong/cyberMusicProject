<template>
    <div class="category-section">
        <h2 class="section-title">音乐分类</h2>
        <div class="category-grid">
            <div v-for="category in categories" 
                 :key="category.id" 
                 class="category-card"
                 @click="handleCategoryClick(category)">
                <div class="category-icon">
                    <i :class="category.icon"></i>
                </div>
                <div class="category-info">
                    <h3 class="category-name">{{ category.name }}</h3>
                    <p class="category-description">{{ category.description }}</p>
                </div>
                <div class="category-count">
                    <span>{{ category.count }}</span>
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    categories: {
        type: Array,
        default: () => [
            {
                id: 1,
                name: '流行音乐',
                description: '最新流行歌曲精选',
                icon: 'fas fa-music',
                count: 128
            },
            {
                id: 2,
                name: '摇滚',
                description: '经典摇滚与独立摇滚',
                icon: 'fas fa-guitar',
                count: 96
            },
            {
                id: 3,
                name: '电子音乐',
                description: '电子舞曲与氛围音乐',
                icon: 'fas fa-headphones',
                count: 85
            },
            {
                id: 4,
                name: '古典音乐',
                description: '交响乐与钢琴曲',
                icon: 'fas fa-violin',
                count: 64
            },
            {
                id: 5,
                name: '嘻哈',
                description: '说唱与嘻哈文化',
                icon: 'fas fa-microphone',
                count: 112
            },
            {
                id: 6,
                name: '民谣',
                description: '传统与现代民谣',
                icon: 'fas fa-guitar-electric',
                count: 72
            }
        ]
    }
});

const emit = defineEmits(['select-category']);

// 处理分类点击
const handleCategoryClick = (category) => {
    emit('select-category', category);
};
</script>

<style scoped>
.category-section {
    padding: 2rem 0;
}

.section-title {
    color: var(--text-color);
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
}

.category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.category-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.category-card:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
}

.category-icon {
    width: 48px;
    height: 48px;
    background: var(--primary-color);
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    color: white;
}

.category-info {
    flex: 1;
}

.category-name {
    color: var(--text-color);
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.category-description {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.875rem;
}

.category-count {
    color: var(--text-color);
    opacity: 0.5;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.category-count i {
    font-size: 0.75rem;
    transition: transform 0.3s ease;
}

.category-card:hover .category-count i {
    transform: translateX(4px);
}

/* 响应式布局 */
@media (max-width: 768px) {
    .category-grid {
        grid-template-columns: 1fr;
    }

    .category-card {
        padding: 1rem;
        gap: 1rem;
    }

    .category-icon {
        width: 40px;
        height: 40px;
        font-size: 1.25rem;
    }

    .category-name {
        font-size: 1rem;
    }
}
</style> 