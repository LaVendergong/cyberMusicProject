<template>
    <div class="theme-switcher">
        <button class="theme-btn" @click="toggleThemePanel">
            <i class="fas fa-palette"></i>
        </button>
        
        <div class="theme-panel" :class="{ 'show': isPanelVisible }" ref="themePanelRef">
            <div class="theme-content">
                <h3>选择主题</h3>
                <div class="theme-list">
                    <div v-for="(theme, key) in themes" 
                         :key="key" 
                         class="theme-item"
                         :class="{ 'active': currentTheme === key }"
                         @click="applyTheme(key)">
                        <div class="theme-preview">
                            <div class="color-preview" :style="{ background: theme.colors.primary }"></div>
                            <div class="color-preview" :style="{ background: theme.colors.secondary }"></div>
                            <div class="color-preview" :style="{ background: theme.colors.accent }"></div>
                        </div>
                        <span>{{ theme.name }}</span>
                    </div>
                </div>
                
                <div class="custom-theme">
                    <h4>自定义主题</h4>
                    <div class="color-inputs">
                        <div v-for="(label, key) in colorLabels" :key="key" class="color-input">
                            <label>{{ label }}</label>
                            <input type="color" 
                                   v-model="customColors[key]" 
                                   :data-color="key">
                        </div>
                    </div>
                    <input type="text" 
                           v-model="customThemeName" 
                           class="theme-name" 
                           placeholder="主题名称">
                    <button class="save-theme" @click="saveCustomTheme">保存主题</button>
                </div>
                
                <button class="close-theme" @click="toggleThemePanel">关闭</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isPanelVisible = ref(false);
const currentTheme = ref(localStorage.getItem('currentTheme') || 'default');
const customThemeName = ref('');
const customColors = ref({
    primary: '#00F0FF',
    secondary: '#FF00FF',
    accent: '#9D00FF',
    background: '#0A0A12',
    surface: '#1a1a2e',
    text: '#FFFFFF'
});
const themePanelRef = ref(null);

const colorLabels = {
    primary: '主要颜色',
    secondary: '次要颜色',
    accent: '强调色',
    background: '背景色',
    surface: '表面色',
    text: '文字颜色'
};

const themes = {
    default: {
        name: '默认赛博朋克',
        colors: {
            primary: '#00F0FF',
            secondary: '#FF00FF',
            accent: '#9D00FF',
            background: '#0A0A12',
            surface: '#1a1a2e',
            text: '#FFFFFF'
        }
    },
    neon: {
        name: '霓虹之夜',
        colors: {
            primary: '#00FF00',
            secondary: '#FF0066',
            accent: '#FFFF00',
            background: '#000000',
            surface: '#111111',
            text: '#FFFFFF'
        }
    },
    retrowave: {
        name: '复古波浪',
        colors: {
            primary: '#FF0080',
            secondary: '#8000FF',
            accent: '#0080FF',
            background: '#120029',
            surface: '#1F0042',
            text: '#FFE1FF'
        }
    },
    nature: {
        name: '自然森林',
        colors: {
            primary: '#4CAF50',
            secondary: '#8BC34A',
            accent: '#FFC107',
            background: '#1B2F1B',
            surface: '#2A442A',
            text: '#E8F5E9'
        }
    },
    ocean: {
        name: '深海之境',
        colors: {
            primary: '#03A9F4',
            secondary: '#00BCD4',
            accent: '#009688',
            background: '#002633',
            surface: '#003847',
            text: '#E1F5FE'
        }
    },
    sunset: {
        name: '日落黄昏',
        colors: {
            primary: '#FF9800',
            secondary: '#FF5722',
            accent: '#F44336',
            background: '#2C1810',
            surface: '#3E2723',
            text: '#FFECB3'
        }
    },
    minimalist: {
        name: '简约白',
        colors: {
            primary: '#000000',
            secondary: '#424242',
            accent: '#1976D2',
            background: '#FFFFFF',
            surface: '#F5F5F5',
            text: '#000000'
        }
    },
    galaxy: {
        name: '星空银河',
        colors: {
            primary: '#7B1FA2',
            secondary: '#E040FB',
            accent: '#00BCD4',
            background: '#0D0221',
            surface: '#1A033E',
            text: '#E1BEE7'
        }
    },
    desert: {
        name: '沙漠黄昏',
        colors: {
            primary: '#FFA000',
            secondary: '#FF6D00',
            accent: '#FFD740',
            background: '#3E2723',
            surface: '#4E342E',
            text: '#FFF8E1'
        }
    },
    arctic: {
        name: '北极极光',
        colors: {
            primary: '#26C6DA',
            secondary: '#00BFA5',
            accent: '#64FFDA',
            background: '#102027',
            surface: '#37474F',
            text: '#E0F7FA'
        }
    },
    sakura: {
        name: '樱花季',
        colors: {
            primary: '#C2185B',
            secondary: '#D81B60',
            accent: '#AD1457',
            background: '#FFF0F5',
            surface: '#FFE4E1',
            text: '#880E4F'
        }
    },
    steampunk: {
        name: '蒸汽朋克',
        colors: {
            primary: '#795548',
            secondary: '#D7CCC8',
            accent: '#FFC107',
            background: '#3E2723',
            surface: '#4E342E',
            text: '#D7CCC8'
        }
    },
    matrix: {
        name: '矩阵代码',
        colors: {
            primary: '#00FF00',
            secondary: '#008F00',
            accent: '#00FF00',
            background: '#000000',
            surface: '#001F00',
            text: '#00FF00'
        }
    },
    vampire: {
        name: '血色黑夜',
        colors: {
            primary: '#D32F2F',
            secondary: '#B71C1C',
            accent: '#FF5252',
            background: '#1A0000',
            surface: '#260000',
            text: '#FFEBEE'
        }
    },
    emerald: {
        name: '翡翠森林',
        colors: {
            primary: '#1B5E20',
            secondary: '#2E7D32',
            accent: '#00C853',
            background: '#F1F8E9',
            surface: '#DCEDC8',
            text: '#1B5E20'
        }
    },
    lavender: {
        name: '薰衣草',
        colors: {
            primary: '#6A1B9A',
            secondary: '#7B1FA2',
            accent: '#8E24AA',
            background: '#F3E5F5',
            surface: '#E1BEE7',
            text: '#4A148C'
        }
    },
    coral: {
        name: '珊瑚礁',
        colors: {
            primary: '#D84315',
            secondary: '#E64A19',
            accent: '#FF7043',
            background: '#FFF3E0',
            surface: '#FFE0B2',
            text: '#BF360C'
        }
    },
    midnight: {
        name: '午夜蓝',
        colors: {
            primary: '#1A237E',
            secondary: '#283593',
            accent: '#3949AB',
            background: '#E8EAF6',
            surface: '#C5CAE9',
            text: '#0D47A1'
        }
    },
    autumn: {
        name: '秋日暖阳',
        colors: {
            primary: '#E65100',
            secondary: '#EF6C00',
            accent: '#FFB74D',
            background: '#FFF3E0',
            surface: '#FFE0B2',
            text: '#E65100'
        }
    },
    neonPink: {
        name: '霓虹粉',
        colors: {
            primary: '#FF1493',
            secondary: '#FF69B4',
            accent: '#FFB6C1',
            background: '#1A0011',
            surface: '#2D001C',
            text: '#FFC0CB'
        }
    },
    cyberpunk: {
        name: '赛博朋克',
        colors: {
            primary: '#FF00FF',
            secondary: '#00FFFF',
            accent: '#FFFF00',
            background: '#000000',
            surface: '#1A1A1A',
            text: '#FFFFFF'
        }
    },
    synthwave: {
        name: '合成波',
        colors: {
            primary: '#FF00AA',
            secondary: '#00FFFF',
            accent: '#FF00FF',
            background: '#000033',
            surface: '#000066',
            text: '#FFFFFF'
        }
    }
};

// 处理点击外部区域
const handleClickOutside = (event) => {
    if (isPanelVisible.value && 
        themePanelRef.value && 
        !themePanelRef.value.contains(event.target) &&
        !event.target.closest('.theme-btn')) {
        isPanelVisible.value = false;
    }
};

// 切换主题面板
const toggleThemePanel = () => {
    isPanelVisible.value = !isPanelVisible.value;
};

// 应用主题
const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (!theme) return;

    currentTheme.value = themeName;
    localStorage.setItem('currentTheme', themeName);

    // 更新CSS变量
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}-color`, value);
    });

    // 触发主题切换事件
    const themeChangeEvent = new CustomEvent('themeChange', {
        detail: {
            theme: themeName,
            colors: theme.colors
        }
    });
    window.dispatchEvent(themeChangeEvent);
};

// 保存自定义主题
const saveCustomTheme = () => {
    if (!customThemeName.value.trim()) {
        alert('请输入主题名称');
        return;
    }

    const themeKey = `custom_${Date.now()}`;
    const newTheme = {
        name: customThemeName.value,
        colors: { ...customColors.value }
    };
    themes[themeKey] = newTheme;

    // 保存到本地存储
    const customThemes = JSON.parse(localStorage.getItem('customThemes') || '{}');
    customThemes[themeKey] = newTheme;
    localStorage.setItem('customThemes', JSON.stringify(customThemes));

    // 应用新主题
    applyTheme(themeKey);
    customThemeName.value = '';
};

// 初始化
onMounted(() => {
    // 加载自定义主题
    const customThemes = JSON.parse(localStorage.getItem('customThemes') || '{}');
    Object.assign(themes, customThemes);
    
    // 应用保存的主题
    applyTheme(currentTheme.value);

    // 添加点击外部区域监听
    document.addEventListener('click', handleClickOutside);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.theme-switcher {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 99999;
}

.theme-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    background: none;
    color: var(--primary-color);
    border: none;
    width: 40px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    font-size: 1.2rem;
    z-index: 99999;
}

.theme-btn:hover {
    transform: scale(1.1);
    color: var(--secondary-color);
}

.theme-panel {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100vh;
    background: var(--surface-color);
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease;
    z-index: 99999;
    transform: translateX(0);
}

.theme-panel.show {
    transform: translateX(-400px);
}

.theme-content {
    padding: 2rem;
    height: 100%;
    overflow-y: auto;
}

.theme-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
}

.theme-item {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.theme-item:hover {
    transform: translateY(-5px);
}

.theme-item.active {
    border: 2px solid var(--primary-color);
}

.theme-preview {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.color-preview {
    width: 20px;
    height: 20px;
    border-radius: 4px;
}

.color-inputs {
    display: grid;
    gap: 1rem;
    margin: 1rem 0;
}

.color-input {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.color-input input[type="color"] {
    width: 50px;
    height: 30px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.theme-name {
    width: 100%;
    padding: 0.5rem;
    margin: 1rem 0;
    border: 1px solid var(--primary-color);
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.2);
    color: var(--text-color);
}

.save-theme,
.close-theme {
    width: 100%;
    padding: 0.8rem;
    margin: 0.5rem 0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.save-theme {
    background: var(--primary-color);
    color: var(--background-color);
}

.close-theme {
    background: var(--secondary-color);
    color: var(--background-color);
}

.save-theme:hover,
.close-theme:hover {
    transform: translateY(-2px);
    opacity: 0.9;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .theme-panel {
        width: 100%;
        right: -100%;
        transform: translateX(0);
    }
    
    .theme-panel.show {
        transform: translateX(-100%);
    }
    
    .theme-list {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
}
</style> 