<template>
    <div class="explore">
        <div class="content">
            <ExplorePage />
        </div>
    </div>
</template>

<script setup>
import ExplorePage from '../components/explore/ExplorePage.vue';
</script>

<style scoped>
.explore {
    min-height: 100vh;
    background: var(--background-color);
}

.content {
    padding: 20px;
}
</style> 