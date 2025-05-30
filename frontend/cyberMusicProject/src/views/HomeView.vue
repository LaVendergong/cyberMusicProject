<template>
    <div class="home">
        <div class="content">
            <PlayerBody />
        </div>
    </div>
</template>

<script setup>
import PlayerBody from '../components/PlayerBody.vue';
</script>

<style scoped>
.home {
    min-height: 100vh;
    background: var(--background-color);
}

.content {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}
</style> 