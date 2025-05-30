<script setup>
  import { ref, onMounted } from 'vue';
  import PlayerHeader from '@/components/PlayerHeader.vue';
  import MiniPlayer from '@/components/bodyElements/MiniPlayer.vue';
  import PlayerController from '@/components/bodyElements/PlayerController.vue';
  import { useAudioStore } from '@/stores/audioStore';
  
  const showFullPlayer = ref(false);
  const audioRef = ref(null);
  const audioStore = useAudioStore();

  onMounted(() => {
    // 监听显示完整播放器事件
    window.addEventListener('showFullPlayer', () => {
      showFullPlayer.value = true;
    });

    // 初始化音频元素
    if (audioRef.value) {
      audioStore.initAudioElement(audioRef.value);
    }
  });
</script>

<template>
  <div class="app">
    <PlayerHeader />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <audio ref="audioRef" style="display: none;"></audio>
    <keep-alive>
      <MiniPlayer />
    </keep-alive>
    <PlayerController v-if="showFullPlayer" @close="showFullPlayer = false" />
  </div>
</template>

<style>
@import './style.css';

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}

.main-content {
  flex: 1;
  padding: 2rem;
  margin-bottom: 80px; /* 为底部播放器留出空间 */
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
