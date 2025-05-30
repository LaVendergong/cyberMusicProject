<template>
  <header>
        <div class="neon-bar"></div>
        <nav>
            <div class="logo">CYBERBEAT</div>
            <button class="menu-btn"><i class="fas fa-bars"></i></button>
            <ul class="nav-links">
                <li><router-link to="/">首页</router-link></li>
                <li><router-link to="/explore">探索</router-link></li>
                <li><router-link to="/playlists">歌单</router-link></li>
                <li><router-link to="/lab">实验室</router-link></li>
            </ul>
            
        </nav>
        
    </header>
</template>

<script setup>
import { ref } from 'vue';
import ThemeSwitcher from './bodyElements/ThemeSwitcher.vue';

defineOptions({
  name: 'PlayerHeader'
})

const isThemePanelVisible = ref(false);

const toggleThemePanel = () => {
    isThemePanelVisible.value = !isThemePanelVisible.value;
};
</script>

<style scoped>
/* 导航栏 */
header {
    padding: 1.5rem 5%;
    background: var(--surface-color);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--primary-color);
}

/* 导航栏容器 */
nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 5%;
    max-width: 1200px;
    margin: 0 auto;
}

/* 导航链接容器 */
.nav-links {
    display: flex;
    gap: 2rem;
    margin-left: auto;
    padding: 0;
    opacity: 1;
}

/* 单个导航项 */
.nav-links li {
    list-style: none;
}

/* 导航链接文字 */
.nav-links a {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.2rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 0.5rem 0;
    position: relative;
    color: var(--primary-color);
    text-decoration: none;
}

/* 霓虹光效增强 */
.nav-links a::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--primary-color);
    transition: width 0.3s ease;
}

.nav-links a:hover::after {
    width: 100%;
}

/* Logo 样式 */
.logo {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--primary-color);
    text-transform: uppercase;
    letter-spacing: 2px;
    position: relative;
    z-index: 1;
}

/* 菜单按钮 */
.menu-btn {
    display: none;
    background: none;
    border: none;
    color: var(--primary-color);
    font-size: 1.5rem;
    cursor: pointer;
}

/* 主题按钮 */
.theme-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--primary-color);
    font-size: 1.2rem;
    cursor: pointer;
    width: 40px;
    height: 40px;
    transition: all 0.3s ease;
}

.theme-btn:hover {
    transform: scale(1.1);
    color: var(--secondary-color);
}

/* 霓虹条效果 */
.neon-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(
        90deg,
        transparent,
        var(--primary-color),
        var(--secondary-color),
        var(--primary-color),
        transparent
    );
    animation: flowingNeon 3s linear infinite;
}

/* 移动端适配 */
@media (max-width: 768px) {
    nav {
        flex-direction: column;
        padding: 1rem;
    }
    
    .logo {
        margin-bottom: 1rem;
        margin-right: 0;
    }
    
    .nav-links {
        margin-left: 0;
        gap: 1rem;
    }

    .menu-btn {
        display: block;
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
    }

    .nav-links {
        display: none;
        width: 100%;
        text-align: center;
    }

    .nav-links.active {
        display: flex;
        flex-direction: column;
    }
}
</style>