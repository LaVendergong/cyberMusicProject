<template>
    <div class="player-body">
        <div class="player-container">
            <PlayerController />
        </div>
        <ThemeSwitcher />
        <ShareSidebar
            :isVisible="isShareVisible"
            :currentSong="currentSong"
            @close="handleShareClose"
        />
    </div>
</template>

<script setup>
    import PlayerController from './bodyElements/PlayerController.vue';
    import ThemeSwitcher from './bodyElements/ThemeSwitcher.vue';
    import ShareSidebar from './bodyElements/ShareSidebar.vue';
    import { ref, onMounted, onUnmounted } from 'vue';

    const isShareVisible = ref(false);
    const currentSong = ref({});

    const handleShareClose = () => {
        isShareVisible.value = false;
    };

    const handleSharePanel = (event) => {
        console.log('收到分享面板事件:', event.detail);
        isShareVisible.value = event.detail.isVisible;
        if (event.detail.currentSong) {
            currentSong.value = event.detail.currentSong;
        }
    };

    onMounted(() => {
        window.addEventListener('sharePanel', handleSharePanel);
    });

    onUnmounted(() => {
        window.removeEventListener('sharePanel', handleSharePanel);
    });
</script>

<style scoped>
.player-body {
    position: relative;
    width: 100%;
}

.player-container {
    width: 100%;
    max-width: 768px;
    margin: 0 auto;
    margin-top: 50px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    position: relative;
    z-index: 1;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 15px;
    backdrop-filter: blur(5px);
    border: 1px solid var(--primary-color);
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.1);
}

/* 移动端适配 */
@media (max-width: 768px) {
    .player-container {
        padding: 1rem;
        gap: 1rem;
        border-radius: 10px;
    }
}
</style>